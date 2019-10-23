
import hsvToHsl from '../utils/hsvToHsl.js';

const simplex = new SimplexNoise();

class Brush {
	constructor(canvas, { detail, size, color, isSpraying }) {
		this.isPainting = false;
		this.lastPosition = {};

		this.setDetail(detail);
		this.setSize(size);
		this.setColor(color);
		this.setSpraying(isSpraying);

		this.initEvents(canvas);
	}

	setSize(size) {
		this.size = size;

		this.generateTip(this.detail);
	}

	setDetail(detail) {
		this.detail = detail;

		this.generateTip(detail);
	}

	setSpraying(spraying) {
		this.isSpraying = spraying;
	}

	// https://workshop.chromeexperiments.com/examples/gui/#4--Color-Controllers
	setColor(hsvColor) {
		const { h, s, l } = hsvToHsl(hsvColor);

		this.hue = h;
		this.saturation = s * 100;
		this.lightness = l * 100;
	}

	generateTip() {
		this.tip = new Array(this.detail).fill().map((_, i) => {
			const angle = Math.PI * 2 * Math.random();
			const radius = 2 + (4 * Math.random());
			const noise = simplex.noise2D(i, i);
			const noiseAmplitude = this.isSpraying ? 2 : 10;
			const lightness = noise * noiseAmplitude;
			let amplitude = Math.random();

			if (i % 20 === 0) {
				amplitude *= 1.2;
			}

			return { angle, radius, lightness, amplitude };
		});
	}

	initEvents(canvas) {
		canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
		canvas.addEventListener('pointerup', e => this.onPointerUp(e));
	}

	onPointerDown() {
		this.generateTip(this.detail);

		this.isPainting = true;
	}

	onPointerUp() {
		this.isPainting = false;
	}

	paint(ctx, from, to, distance = 0) {
		const brushSize = this.size + (5 * distance);

		this.tip.forEach((drop, i) => this.paintDrop(ctx, drop, i, from, to, brushSize));

		if (this.isSpraying && Math.random() > 0.1) {
			const angle = Math.PI * 2 * Math.random();
			const length = this.size * (1.5 + (Math.random() * 0.75));
			const radius = 1 + Math.random();

			ctx.fillStyle = this.getColor();
			ctx.lineWidth = radius;
			ctx.lineCap = 'round';

			ctx.beginPath();
			ctx.arc(to.x + (Math.cos(angle) * length), to.y + (Math.sin(angle) * length), radius, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.closePath();
		}

		this.lastPosition = to;
	}

	paintDrop(ctx, drop, index, from, to, brushSize) {
		const { angle, radius, lightness, amplitude } = drop;

		const x = Math.cos(angle);
		const y = Math.sin(angle);

		const position = {
			x: x * brushSize * amplitude,
			y: y * brushSize * amplitude,
		};

		ctx.strokeStyle = this.getColor(lightness);
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.moveTo(from.x + position.x, from.y + position.y);
		ctx.lineTo(to.x + position.x, to.y + position.y);
		ctx.stroke();
		ctx.closePath();
	}

	getColor(lightnessModifier = 0) {
		return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + lightnessModifier}%, 0.5)`;
	}
}

export default Brush;
