
import hsvToHsl from '../utils/hsvToHsl.js';

const simplex = new SimplexNoise();

class Brush {
	constructor(canvas, { type = 'marker', detail, size, color, isSpraying }) {
		this.isPainting = false;

		this.setType(type);
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

	setType(type) {
		this.type = type;
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
		if (this.type === 'marker') {
			this.tip = this.createMarkerTip(this.detail);
		} else {
			this.tip = this.createSprayTip(this.detail);
		}
	}

	createMarkerTip() {
		const width = this.size;
		const widthHalf = width * 0.5;
		const height = this.size * 0.5;
		const heightHalf = height * 0.5;

		const tip = [];

		while (tip.length < this.detail) {
			const i = tip.length;
			const lightness = this.getDropLightness(i, i, true);
			const radius = 2 + (4 * Math.random());;

			const point = {
				position: {
					x: (Math.random() * width) - widthHalf,
					y: (Math.random() * height) - heightHalf,
				},
				radius,
				lightness,
			};

			tip.push(point);
		}

		return tip;
	}

	createSprayTip() {
		return new Array(this.detail).fill().map((_, i) => {
			const radius = 2 + (6 * Math.random());
			const lightness = this.getDropLightness(i, i, false);

			const angle = Math.PI * 2 * Math.random();
			let length = this.size * Math.random();

			if (i % 20 === 0) {
				length *= 1.2;
			}

			const position = {
				x: Math.cos(angle) * length,
				y: Math.sin(angle) * length,
			};

			return { position, radius, lightness };
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

		this.tip.forEach((drop, i) => this.paintDrop(ctx, drop, from, to, brushSize));

		if (this.type === 'spray') {
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

			this.generateTip();
		}
	}

	paintDrop(ctx, drop, from, to) {
		const { position, radius, lightness } = drop;

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

	getDropLightness(x, y, bevelMore = true) {
		const noise = simplex.noise2D(x, y);
		const noiseAmplitude = bevelMore ? 10 : 2;
		const lightness = noise * noiseAmplitude;

		return lightness;
	}
}

export default Brush;
