const NUM_BLOCKS = 500;

class Drawer {
	constructor(options = { selector: '.js-drawer', buffer: null }) {
		Object.assign(this, options);

		this.initialize();
	}

	initialize() {
		this.progress = 0;
		this.isSeeking = false;
		this.pointerX = 0;

		this.el = document.querySelector(this.selector);

		if (!this.el) {
			throw new Error('Drawer: element not found');
		}

		this.canvas = this.el.querySelector('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.progressBar = this.el.querySelector('.js-drawer-progress');

		this.width = this.el.offsetWidth;
		this.halfWidth = this.width * 0.5;
		this.height = 100;
		this.halfHeight = this.height * 0.5;

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.seekStartHandler = this.seekStartHandler || this.noop;
		this.seekEndHandler = this.seekEndHandler || this.noop;
		this.seekHandler = this.seekHandler || this.noop;

		this.initEvents();
	}

	noop() {
		// comment
	}

	initEvents() {
		this.el.addEventListener('mousedown', (e) => this.onStartSeek(e));
		this.el.addEventListener('mouseup', (e) => this.onEndSeek(e));
		this.el.addEventListener('mousemove', (e) => this.onSeek(e));
	}

	draw(buffer) {
		let channel = buffer.getChannelData(0);
		let blockStep = Math.floor(channel.length / NUM_BLOCKS);
		let blockWidth = this.width / NUM_BLOCKS;
		let negValues = [];
		let posValues = [];
		let maxValue = 0;
		let x = 0;
		let i;

		this.clear();

		// loop 1 to collect values and get maxValue...
		// https://jsfiddle.net/rfreqbh9/5/
		for (i = 0; i < NUM_BLOCKS; i++) {
			// value: PCM with a nominal range between -1 and +1
			let value = Math.abs(channel[i * blockStep]);

			if (value > maxValue) {
				maxValue = value;
			}

			posValues.push(value);
			negValues.push(-value);
		}

		this.ctx.beginPath();
		this.ctx.moveTo(0, this.halfHeight);

		// loop forwards, draw upper side
		for (i = 0; i < posValues.length; i++) {
			x += blockWidth;
			let value = posValues[i];

			let valuePercentage = (value / maxValue) * 100;
			let barHeight = (this.halfHeight * 0.01) * valuePercentage;
			let y = this.halfHeight - barHeight;

			this.ctx.lineTo(x, y);
		}

		i = posValues.length;

		// loop backwards, draw under side (?)
		while (i--) {
			let value = posValues[i];

			let valuePercentage = (value / maxValue) * 100;
			let barHeight = (this.halfHeight * 0.01) * valuePercentage;
			let y = this.halfHeight + barHeight;

			this.ctx.lineTo(x, y);
			x -= blockWidth;
		}

		let negative = 'rgba(220, 0, 0, 0.5)';
		let positive = 'rgba(0, 200, 0, 1)';

		let gradient = this.ctx.createLinearGradient(this.halfWidth, 0, this.halfWidth, this.height);

		// Add colors
		gradient.addColorStop(0, negative);
		gradient.addColorStop(0.2, negative);
		gradient.addColorStop(0.5, positive);
		gradient.addColorStop(0.8, negative);
		gradient.addColorStop(1, negative);

		// Fill with gradient
		this.ctx.fillStyle = gradient;

		this.ctx.lineTo(0, this.halfHeight);
		this.ctx.fill();
		this.ctx.closePath();
	}

	drawValues(valuesArray, maxValue) {
		let blockWidth = this.width / NUM_BLOCKS;
		let x = 0;
		let i;

		for (i = 0; i < valuesArray.length; i++) {
			let value = valuesArray[i];

			let valuePercentage = (value / maxValue) * 100;
			let barHeight = (this.halfHeight * 0.01) * valuePercentage;
			let y = this.halfHeight - barHeight;

			this.ctx.lineTo(x, y);
			x += blockWidth;
		}
	}

	getBarColor(percentage) {
		const green = 120;

		percentage = Math.abs(percentage);

		let hue = green - ((green * 0.01) * percentage);

		return `hsl(${hue}, 100%, 40%)`;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	onStartSeek(e) {
		let clickX = e.offsetX;
		let progress = (clickX / this.width) * 100;

		this.isSeeking = true;
		this.pointerX = clickX;

		this.seekStartHandler(progress);
	}

	onEndSeek(e) {
		this.isSeeking = false;
		this.seekEndHandler();
	}

	onSeek(e) {
		let clickX = e.offsetX;
		let diff = Math.abs(clickX - this.pointerX);

		if (!this.isSeeking || diff < 20) {
			return;
		}

		let progress = (clickX / this.width) * 100;
		let diffProgress = progress - this.progress;

		this.pointerX = clickX;

		this.seekHandler(progress, diffProgress);
	}

	update(progress) {
		this.progress = progress;
		this.progressBar.style.width = `${progress}%`;
	}

	reset() {
		this.update(0);
		this.clear();
	}
}

export default Drawer;
