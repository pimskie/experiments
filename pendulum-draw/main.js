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

	set width(w) {
		this.canvas.width = w;
	}

	set height(h) {
		this.canvas.height = h;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	drawLine(from, to, width = 1, color = 0x000000) {
		this.ctx.beginPath();
		this.ctx.lineWidth = width;
		this.ctx.strokeStyle = color;
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.closePath();
		this.ctx.stroke();
	}
}

class Arm {
	constructor(position, length, angle, speed, parent = null) {
		this.position = position;
		this.length = length;
		this.angle = angle;
		this.speed = speed;
		this.parent = parent;

		this.destination = { x: 0, y: 0 };

		this.update();
	}

	get origin() {
		return this.parent
			? this.parent.destination
			: this.position;
	}

	update() {
		this.angle += this.speed;

		this.destination.x = this.origin.x + Math.cos(this.angle) * this.length;
		this.destination.y = this.origin.y + Math.sin(this.angle) * this.length;
	}
}

(async () => {
	const palettes = await fetch('//unpkg.com/nice-color-palettes@2.0.0/100.json')
		.then(res => res.json());

	const stageArms = new Stage(document.querySelector('.js-arms'), 500, 500);
	const stageTrail = new Stage(document.querySelector('.js-trails'), 500, 500);

	const options = {
		arms: 5,
		speed: 4,
		length: 100,
		lengthMultiplier: 0.5,
		speedMultiplier: -1.5,
		remake() {
			generate();
		}
	};

	let palette = [];
	let arms = [];

	const reset = () => {
		stageArms.clear();
		stageTrail.clear();

		arms = [];

		palette = palettes.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1])[0];
	};

	const generate = () => {
		reset();

		const position = { x: stageArms.width * 0.5, y: stageArms.height * 0.5 };
		const angle = Math.random() * Math.PI * 2;

		let speed = options.speed * 0.01;
		let length = options.length;

		let parent = null;

		for (let i = 0; i < options.arms; i++) {
			const arm = new Arm(position, length, angle, speed, parent);

			arms.push(arm);

			parent = arm;
			speed *= options.speedMultiplier;
			length *= options.lengthMultiplier;
		}
	};

	const loop = () => {
		stageArms.clear();

		arms.forEach((arm, index) => {
			const trailColor = palette[(index + palette.length) % palette.length];
			const trailFrom = { x: arm.destination.x, y: arm.destination.y };

			arm.update();

			const trailTo = { x: arm.destination.x, y: arm.destination.y };

			stageTrail.drawLine(trailFrom, trailTo, 0.5, trailColor);
			stageArms.drawLine(arm.origin, arm.destination, 0.5, '#111');
		});

		requestAnimationFrame(loop);
	};

	const gui = new dat.GUI();

	gui.add(options, 'arms').min(2).max(5).step(1).onFinishChange(generate);
	gui.add(options, 'speed').min(1).max(5).step(1).onFinishChange(generate);
	gui.add(options, 'length').min(10).max(100).step(1).onFinishChange(generate);
	gui.add(options, 'lengthMultiplier').min(-2).max(2).step(0.25).onFinishChange(generate);
	gui.add(options, 'speedMultiplier').min(-2).max(2).step(0.25).onFinishChange(generate);
	gui.add(options, 'remake');
	gui.close();

	document.body.addEventListener('click', () => generate());
	generate();
	loop();

})();
