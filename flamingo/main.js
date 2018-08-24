// https://stackoverflow.com/questions/25875972/how-to-get-volume-level-of-mp3-at-specific-point-of-playback-using-javascript
// https://github.com/cwilso/volume-meter/blob/master/volume-meter.js

import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';
import IKSystem from 'https://rawgit.com/pimskie/ik-system/master/ik-system.js';

const ctx = Utils.qs('canvas').getContext('2d');

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;
const MID = new Vector(MID_X, MID_Y);
const TAU = Math.PI * 2;

ctx.canvas.width = W;
ctx.canvas.height = H;

ctx.lineCap = 'round';

const bp = () => ctx.beginPath();
const cp = () => ctx.closePath();
const mt = (vec) => ctx.moveTo(vec.x, vec.y);
const lt = (vec) => ctx.lineTo(vec.x, vec.y);
const st = () => ctx.stroke();

// p5.Sound
const frequencies = {
	bass: [20, 140],
	lowMid: [140, 400],
	mid: [400, 2600],
	highMid: [2600, 5200],
	trebble: [5200, 14000],
};

const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(Utils.qs('.js-audio'));

const gain = audioContext.createGain();

const lowpass = audioContext.createBiquadFilter();
lowpass.type = 'lowpass';
lowpass.frequency.setValueAtTime(50, audioContext.currentTime);

const highpass = audioContext.createBiquadFilter();
highpass.type = 'highpass';
highpass.frequency.setValueAtTime(30, audioContext.currentTime);

const analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 2048;

const bufferLength = analyser.fftSize;
const waveData = new Uint8Array(bufferLength);
const frequencyData = new Uint8Array(bufferLength);

const anchor = new Vector(MID.x, H);
const ik = new IKSystem(anchor);

const numArms = 10;
const armLength = 30;
const ikLength = numArms * armLength;

for (let i = 0; i < numArms; i++) {
	ik.addArm(new Vector(), 0, armLength);
}

let mouse = new Vector(MID_X + 50, MID_Y - 50);
let target = mouse.clone();

// P5.Sound
const getEnergy = (frequency1, frequency2, sampleRate, binCount) => {
	if (frequency1 > frequency2) {
		[frequency2, frequency1] = [frequency1, frequency2];
	}

	const nyquist = sampleRate / 2;
	const lowIndex = Math.round(frequency1 / nyquist * binCount);
	const highIndex = Math.round(frequency2 / nyquist * binCount);

	let total = 0;

	for (let i = lowIndex; i <= highIndex; i++) {
		total += frequencyData[i] / 255;
	}

	return total / (highIndex - lowIndex);
};

const drawArms = (arms, width = 15) => {
	ctx.strokeStyle = '#000';
	ctx.lineWidth = width;

	arms.forEach((arm) => {
		bp();
		mt(arm.start);
		lt(arm.end);
		st();
		cp();
	});
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

let angle = -Math.PI;
let oldRadius = 0;

const loop = () => {
	clear();

	const sliderValue = parseInt(Utils.qs('.js-slider').value, 10);
	const { frequencyBinCount, context: { sampleRate } } = analyser;

	analyser.getByteTimeDomainData(waveData);
	analyser.getByteFrequencyData(frequencyData);

	let high = getEnergy(10000, 11000, sampleRate, frequencyBinCount);
	let mid = getEnergy(6000, 9000, sampleRate, frequencyBinCount);
	const low = getEnergy(100, 200, sampleRate, frequencyBinCount);

	let verticalAmplitude = low * ikLength * 1;
	const thickness = 10 + (low * 35);
	let boom = 0;

	const numBars = 500;
	const barWidth = ctx.canvas.width / numBars;
	const waveStep = Math.floor(waveData.length / numBars);
	let barX = 0;

	ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

	for (let i = 0; i < numBars; i++) {
		const value = waveData[i * waveStep] / 128;
		const barHeight = value * 50;

		ctx.beginPath();
		ctx.fillRect(barX, MID_Y - barHeight, barWidth, barHeight);
		ctx.closePath();

		barX += barWidth;

		boom += value;
	}


	let radius = mid * 250;
	const radiusDiff = radius - oldRadius;

	if (radiusDiff > 40) {
		angle += Math.PI;
		verticalAmplitude = ikLength;
	}

	oldRadius = radius;

	mouse.x = MID_X + (Math.cos(angle) * radius);
	mouse.y = H - verticalAmplitude;

	ik.update(target);
	drawArms(ik.arms, thickness);

	const smoothness = 3;

	target.x += (mouse.x - target.x) / smoothness;
	target.y += (mouse.y - target.y) / smoothness;

	angle += 0.01;

	requestAnimationFrame(loop);
};

const init = () => {
	gain.gain.setValueAtTime(1, audioContext.currentTime);

	source.connect(gain);
	source.connect(analyser);

	gain.connect(audioContext.destination);

	loop();
};


const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { target, clientX: pointerX, clientY: pointerY } = event;

	const x = pointerX - target.offsetLeft;
	const y = pointerY - target.offsetTop;

	// mouse.x = x;
	// mouse.y = y;
};


ctx.canvas.addEventListener('mousemove', onPointerMove);
ctx.canvas.addEventListener('touchmove', onPointerMove);

init();
