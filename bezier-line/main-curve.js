const randomBetween = (min, max) => (Math.random() * (max - min + 1)) + min;

class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.width = width;
		this.height = height;
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	get widthHalf() {
		return this.width * 0.5;
	}

	get heightHalf() {
		return this.height * 0.5;
	}

	set width(w) {
		this.canvas.width = w;
	}

	set height(h) {
		this.canvas.height = h;
	}

	drawArc(pos, r = 5, fill = '#000') {
		this.ctx.beginPath();
		this.ctx.fillStyle = fill;
		this.ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
		this.ctx.fill();
		this.ctx.closePath();
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

(async () => {
	const palettes = await fetch('//unpkg.com/nice-color-palettes@2.0.0/100.json')
		.then(res => res.json());

	const stage = new Stage(document.querySelector('.js-arms'), window.innerWidth, window.innerHeight);

	const options = {
		remake() {
			generate();
		}
	};

	let palette = [];

	const reset = () => {
		stage.clear();

		palette = palettes.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1])[0];
	};

	const generate = () => {
		reset();
	};

	const radiusPoints = 250;
	const numPoints = 5;

	const points = new Array(numPoints)
		.fill()
		.map(() => Math.random() * Math.PI * 2)
		.sort((a, b) => a - b)
		.map(a => ({ a, x: stage.widthHalf + (Math.cos(a) * radiusPoints), y: stage.heightHalf + (Math.sin(a) * radiusPoints) }));

	const controlPoints = points.map((point, i) => {
		const nextIndex = ((i + 1) + points.length) % points.length;
		const nextPoint = points[nextIndex];

		const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
		const distance = Math.hypot(nextPoint.x - point.x, nextPoint.y - point.y);

		const newAngle = angle - 0.5; //randomBetween(-1, 1);
		const newDistance = distance * 0.5; // distance + randomBetween(-100, 100);

		const cp = {
			x: point.x + (Math.cos(newAngle) * newDistance),
			y: point.y + (Math.sin(newAngle) * newDistance),
		};

		return cp;
	});

	const firstPoint = points.shift();

	const loop = () => {
		const { ctx } = stage;
		stage.clear();

		ctx.beginPath();
		ctx.moveTo(firstPoint.x, firstPoint.y);

		for (let i = 0; i < points.length; i += 1) {
			const cp = controlPoints[i];
			const point = points[i];

			ctx.quadraticCurveTo(cp.x, cp.y, point.x, point.y);
			// ctx.lineTo(point.x, point.y);
		}

		ctx.closePath();
		ctx.stroke();

		// requestAnimationFrame(loop);
	};


	// document.body.addEventListener('click', () => generate());

	generate();
	loop();

})();
