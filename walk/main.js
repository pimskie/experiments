/* globals Vector: false, noise: false, dat: false, */
noise.seed(Math.random());

const randomBetween = (min, max) => (Math.random() * (max - min + 1)) + min;
const distanceBetween = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

class Stage {
	constructor() {
		this.rafId = null;

		this.canvas = document.querySelector('.js-canvas');
		this.ctx = this.canvas.getContext('2d');

		this.run = this.run.bind(this);

		this.settings = {
			walkers: 4,
			thickness: 9,
			curvy: 0.3,
			spread: 4,
			color: '#000',
			generate: this.run,
		};
	}

	init() {
		this.loop = this.loop.bind(this);

		window.addEventListener('resize', this.run);

		this.setSize();

		return this;
	}

	setSize() {
		this.width = this.canvas.offsetWidth;
		this.height = this.width;

		this.midX = this.width >> 1;
		this.midY = this.height >> 1;

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		return this;
	}

	generate() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.walkers = [];

		let numWalkers = this.settings.walkers;

		while (numWalkers--) {
			const decay = (Math.floor(Math.random() * (9999 - 9800)) + 9800) * 0.0001;
			const thickness = this.settings.thickness;
			const position = new Vector(this.midX, this.height);
			const velocity = new Vector();

			velocity.length = 1 + (Math.random() * 2);
			velocity.angle = -Math.PI / 2;

			this.createWalker({ position, velocity, thickness, decay });
		}

		return this;
	}

	createWalker({
		position = new Vector(),
		velocity = new Vector(1, 0),
		thickness = 15,
		decay = 0.9,
		depth = 0,
	} = {}) {
		this.walkers.push(new Walker({ position, velocity, decay, thickness, depth }));
	}

	branch(walker, numBranches = 2) {
		while (numBranches--) {
			const thickness = walker.thickness;
			const position = walker.position.clone();
			const velocity = walker.velocity.clone();
			const angleMod = randomBetween(1, this.settings.spread) * 0.1;
			const decay = walker.decay * 0.95;
			const depth = walker.depth + 1;

			velocity.angle = (numBranches % 2 === 0)
				? velocity.angle + angleMod
				: velocity.angle - angleMod;

			velocity.length = walker.velocity.length + (Math.random() * 0.25);

			this.createWalker({ position, velocity, thickness, decay, depth });
		}
	}

	run() {
		cancelAnimationFrame(this.rafId);

		this.setSize();
		this.generate();
		this.loop();

		return this;
	}

	loop() {
		this.walkers.forEach((walker) => {
			let diffAngle = noise.perlin2(
				walker.position.x * 0.08,
				walker.position.y * 0.08
			) * this.settings.curvy;

			walker.update(diffAngle);

			this.ctx.beginPath();
			this.ctx.lineCap = 'round';
			this.ctx.strokeStyle = this.settings.color;
			this.ctx.lineWidth = walker.thickness;
			this.ctx.moveTo(walker.positionPrev.x, walker.positionPrev.y);
			this.ctx.lineTo(walker.position.x, walker.position.y);

			this.ctx.stroke();
			this.ctx.closePath();

			walker.checkBounds(this.width, this.height);

			if (walker.canBranch) {
				this.branch(walker);
			}
		});

		this.walkers = this.walkers.filter(w => !w.isDead);
		this.rafId = requestAnimationFrame(this.loop);
	}
}

class Walker {
	constructor({
		position = new Vector(),
		velocity = new Vector(1, 0),
		thickness = 15,
		decay = 0.994,
		age = 0,
		depth = 0,
	} = {}) {
		Object.assign(this, { position, velocity, thickness, decay, age, depth });

		this.positionPrev = this.position.clone();

		this.isDead = false;
	}

	checkBounds(width) {
		const { x, y } = this.position;

		const r = width >> 1;
		const distance = distanceBetween(r, r, x, y);

		if (distance >= r) {
			this.velocity.angle = Math.random() * (Math.PI * 2);
			this.velocity.length *= 0.95;
			this.decay *= 0.9;
		}
	}

	update(diffAngle) {
		this.thickness *= this.decay;

		if (this.thickness <= 0.2) {
			this.isDead = true;

			return;
		}

		this.velocity.angle += diffAngle;
		this.positionPrev = this.position.clone();
		this.position.addSelf(this.velocity);
	}

	get canBranch() {
		return !this.isDead &&
			this.depth < 2 &&
			~~(Math.random() * 30) === 1;
	}
}

const stage = new Stage()
	.init()
	.run();

const gui = new dat.GUI();
gui.add(stage.settings, 'walkers', 1, 6).step(1).onFinishChange(stage.run);
gui.add(stage.settings, 'thickness', 2, 15).step(1).onFinishChange(stage.run);
gui.add(stage.settings, 'curvy', 0, 0.5).step(0.01).onFinishChange(stage.run);
gui.add(stage.settings, 'spread', 2, 6).step(1).onFinishChange(stage.run);
gui.addColor(stage.settings, 'color').onFinishChange(stage.run);
gui.add(stage.settings, 'generate');

document.body.addEventListener('click', (e) => {
	const element = e.target;

	if (!gui.domElement.contains(element)) {
		stage.run();
	}
});
