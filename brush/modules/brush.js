
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

		this.generateTip();
	}

	setDetail(detail) {
		this.detail = detail;

		this.generateTip();
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

	generateTip(speed = 0) {
		this.tip = this.type === 'marker'
			? this.createMarkerTip()
			: this.createSprayTip(speed);
	}

	createMarkerTip() {
		const width = this.size * 2;
		const widthHalf = width * 0.5;
		const height = this.size;
		const heightHalf = height * 0.5;

		const tip = new Array(this.detail).fill().map((_, i) => {
			const lightness = this.getPointLightness(i, i, true);
			const radius = 1 + (1 * Math.random());

			const point = {
				position: {
					x: (Math.random() * width) - widthHalf,
					y: (Math.random() * height) - heightHalf,
				},
				radius,
				lightness,
			};

			return point;
		});

		return tip;
	}

	createSprayTip(speed = 0) {
		const maxGrow = 150;

		return new Array(1).fill().map((_, i) => {
			const radiusIncrease = maxGrow * speed;
			const radiusIncreasePercent = radiusIncrease / maxGrow;
			const radius = this.size + radiusIncrease;

			const alpha = 1 - (speed * 0.95);
			const blur = 40 * radiusIncreasePercent;

			const angle = Math.PI * 2 * randomValue();

			const position = {
				x: Math.cos(angle),
				y: Math.sin(angle),
			};

			return { position, radius, alpha, blur };
		});
	}

	initEvents(canvas) {
		canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
		canvas.addEventListener('pointerup', e => this.onPointerUp(e));
	}

	onPointerDown() {
		this.generateTip();

		this.isPainting = true;
	}

	onPointerUp() {
		this.isPainting = false;
	}

	paint(ctx, from, to, speed = 0) {
		this.tip.forEach((drop, i) => this.paintDrop(ctx, drop, from, to));

		if (this.type === 'spray') {
			if (Math.random() > 0.25) {
				this.paintDiffuse(ctx, to);
			}

			this.generateTip(speed);
		}
	}

	paintDrop(ctx, drop, from, to) {
		const { position, radius, lightness, alpha = 1, blur = 0 } = drop;

		ctx.save();

		if (this.type === 'marker') {
			const color = this.getColor(lightness);

			ctx.strokeStye = color;
			ctx.lineWidth = radius * 2;
			ctx.lineCap = 'round';

			ctx.beginPath();
			ctx.moveTo(from.x + position.x, from.y + position.y);
			ctx.lineTo(to.x + position.x, to.y + position.y);
			ctx.stroke();
			ctx.closePath();
		} else {
			const x = to.x + position.x;
			const y = to.y + position.y;
			const colorFrom = this.getColor(lightness, alpha);
			const colorTo = this.getColor(lightness, 0);
			const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);

			gradient.addColorStop(0, colorFrom);
			gradient.addColorStop(1, colorTo);
			ctx.fillStyle = gradient;

			ctx.filter = `blur(${blur}px)`;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}

		ctx.restore();

	}

	paintDiffuse(ctx, position) {
		const angle = Math.PI * 2 * Math.random();
		const length = this.size * (1.5 + (Math.random() * 0.75));
		const radius = 1 + Math.random();
		const alpha = 0.5 + (Math.random() * 0.5);

		ctx.fillStyle = this.getColor(0, alpha);
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.arc(position.x + (Math.cos(angle) * length), position.y + (Math.sin(angle) * length), radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
	}

	getColor(lightnessModifier = 0, alpha = 1) {
		return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + lightnessModifier}%, ${alpha})`;
	}

	getPointLightness(x, y, bevelMore = true) {
		const noise = simplex.noise2D(x, y);
		const noiseAmplitude = bevelMore ? 5 : 0;
		const lightness = noise * noiseAmplitude;

		return lightness;
	}
}

export default Brush;
