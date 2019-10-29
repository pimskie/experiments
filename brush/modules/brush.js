
import Ziggurat from '../utils/ziggurat.js';
import randomGaussian from '../utils/random-gaussian.js';
import hsvToHsl from '../utils/hsvToHsl.js';

const simplex = new SimplexNoise();
const ziggurat = new Ziggurat();

const randomValue = () => Math.random(); // ziggurat.nextGaussian();

class Brush {
	constructor(canvas, { type = 'marker', detail, size, color }) {
		this.isPainting = false;

		this.setType(type);
		this.setDetail(detail);
		this.setSize(size);
		this.setColor(color);

		this.initEvents(canvas);
	}

	get isSprayCan() {
		return this.type === 'spray';
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

	// https://workshop.chromeexperiments.com/examples/gui/#4--Color-Controllers
	setColor(hsvColor) {
		const { h, s, l } = hsvToHsl(hsvColor);

		this.hue = h;
		this.saturation = s * 100;
		this.lightness = l * 100;
	}

	generateTip() {
		this.tip = this.type === 'marker'
			? this.createMarkerTip(this.detail)
			: this.createSprayTip(this.detail);
	}

	createMarkerTip() {
		const width = this.size * 2;
		const widthHalf = width * 0.5;
		const height = this.size;
		const heightHalf = height * 0.5;

		const tip = [];

		while (tip.length < this.detail) {
			const i = tip.length;
			const lightness = this.getPointLightness(i, i, true);
			const radius = 2 + (4 * Math.random());

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
		return new Array(10).fill().map((_, i) => {
			const radius = (this.size * 1.5) - (this.size * (Math.random() * 0.5));
			const length = this.size * (0.2 * randomValue());

			const lightness = this.getPointLightness(i, i, false);

			const angle = Math.PI * 2 * randomValue();

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
			if (Math.random() > 0.5) {
				this.paintDiffuse(ctx, to);
			}

			this.generateTip();
		}
	}

	paintDrop(ctx, drop, from, to) {
		const { position, radius, lightness } = drop;
		const color = this.getColor(lightness);

		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';

		if (this.type === 'marker' || 1) {
			ctx.beginPath();
			ctx.moveTo(from.x + position.x, from.y + position.y);
			ctx.lineTo(to.x + position.x, to.y + position.y);
			ctx.stroke();
			ctx.closePath();
		} else {
			ctx.beginPath();
			ctx.arc(to.x + position.x, to.y + position.y, radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}
	}

	paintDiffuse(ctx, position) {
		const angle = Math.PI * 2 * Math.random();
		const length = this.size * (1.5 + (Math.random() * 0.75));
		const radius = 1 + Math.random();

		ctx.fillStyle = this.getColor();
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.arc(position.x + (Math.cos(angle) * length), position.y + (Math.sin(angle) * length), radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
	}

	getColor(lightnessModifier = 0) {
		return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + lightnessModifier}%, 0.5)`;
	}

	getPointLightness(x, y, bevelMore = true) {
		const noise = simplex.noise2D(x, y);
		const noiseAmplitude = bevelMore ? 5 : 1;
		const lightness = noise * noiseAmplitude;

		return lightness;
	}
}

export default Brush;
