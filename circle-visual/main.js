/**
 * heavily inspired by:
 * Rectangle World
 * http://rectangleworld.com/blog/archives/462
 */

// http://stackoverflow.com/a/5624139/5930258
const hexToRgb = (hex) => {
	let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

	hex = hex.replace(shorthandRegex, (m, r, g, b) => {
		return r + r + g + g + b + b;
	});

	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}

const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

let winWidth;
let winHeight;

let midX;
let midY;

let tick;

let rafId;

class Circle {
	constructor(options) {
		this.assign(options);

		return this;
	}

	create() {
		this.points = [];
		this.radius = (this.grow) ? 0 : this.radius;

		let angle = 0;
		let step = (Math.PI * 2) / this.segments;

		for (let i = 0; i < this.segments; i++) {
			let x = this.x + (Math.cos(angle) * this.radius);
			let y = this.y + (Math.sin(angle) * this.radius);

			this.points.push({ x, y, angle });

			angle += step;
		}

		return this;
	}

	update(x, y, endX) {
		this.x = x;
		this.y = y;

		if (this.grow) {
			this.radius = Math.max(0, this.maxRadius * (x / endX));
		}
	}

	updatePoint(p, tick, baseX, baseY) {
		p.x = Math.cos(p.angle);
		p.y = Math.sin(p.angle);

		let smoothness = 1;
		let nx = p.x * smoothness;
		let ny = p.x * smoothness; // x intentionally
		let radius = this.radius + this.getNoise(tick + nx, tick + ny);

		p.x *= radius;
		p.y *= radius;

		p.x += baseX;
		p.y += baseY;
	}

	getNoise(a, b) {
		const max = this.radius * 1.5;
		const n = noise.perlin2(a, b);

		// map between -1, 1
		return (n + 1) * (max + max) / 2 - max;
	}

	assign(options) {
		Object.assign(this, options);
		this.maxRadius = this.radius;

		this.reset();
	}

	reset() {
		this.create();
	}

	// when setting a rgb value ([r, g, b]) directly in dat.ui, it sometimes returns a hex
	// so, input a hex by default and convert it manually to rgb
	set color1(c1) {
		let rgb = hexToRgb(c1).join(', ');

		this._color1 = c1;
		this.rgb1 = `rgba(${rgb}, ${this.alpha})`;
	}

	set color2(c2) {
		let rgb = hexToRgb(c2).join(', ');

		this._color2 = c2;
		this.rgb2 = `rgba(${rgb}, ${this.alpha})`;
	}

	get color1() { return this._color1; }

	get color2() { return this._color2; }

	get rgba1() { return this.rgb1; }

	get rgba2() { return this.rgb2;	}
}

const assignColors = () => {
	circle.color1 = options.color1;
	circle.color2 = options.color2;
	circle.alpha = options.alpha;
}

const setupStage = () => {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	midX = winWidth >> 1;
	midY = winHeight >> 1;

	tick = performance.now();

	ctx.clearRect(0, 0, winWidth, winHeight);

	ctx.canvas.width = winWidth;
	ctx.canvas.height = winHeight;
}

const redraw = () => {
	setupStage();

	circle.assign(options);
}

const loop = () => {
	tick += options.randomness;

	circle.update(circle.x + 2, midY + (midY * noise.perlin2(tick, tick)), winWidth);

	let currX = circle.x;
	let currY = circle.y;

	let grad = ctx.createLinearGradient(-circle.radius, currY, circle.radius, currY);
	grad.addColorStop(0, circle.rgba1);
	grad.addColorStop(1, circle.rgba2);

	ctx.strokeStyle = grad;
	ctx.lineWidth = options.lineWidth;

	ctx.save();
	ctx.translate(currX, currY);

	circle.points.forEach((point, index) => {
		ctx.beginPath();

		ctx.moveTo(point.x - currX, point.y - currY);

		circle.updatePoint(point, tick, currX, currY);

		ctx.lineTo(point.x - currX, point.y - currY);

		ctx.stroke();
		ctx.closePath();
	});

	ctx.restore();
	rafId = requestAnimationFrame(loop);
}

window.addEventListener('resize', redraw);

setupStage();

let options = {
	segments: 1000,
	radius: 150,
	x: -100,
	y: midY,
	grow: false,
	radius: 130,
	color1: '#d2205e',
	color2: '#29cafc',
	alpha: 0.1,
	randomness: 0.005,
	lineWidth: 1
};

let circle = new Circle(options);

noise.seed(Math.random());
redraw();
loop();

let gui = new dat.GUI();
let folderColor = gui.addFolder('Appearance');
let folderSettings = gui.addFolder('Circle settings');

folderColor.addColor(options, 'color1').onChange(assignColors);
folderColor.addColor(options, 'color2').onChange(assignColors);
folderColor.add(options, 'alpha').step(0.001).min(0.01).max(1).onChange(assignColors);
folderColor.add(options, 'lineWidth').step(1).min(1).max(5);

folderSettings.add(options, 'segments', 100, 1500).step(1).onFinishChange(redraw);
folderSettings.add(options, 'grow').onFinishChange(redraw);

gui.add({ redraw }, 'redraw');
folderColor.open();
gui.close();
