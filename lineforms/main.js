class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');

		this.setSize(width, height);
	}

	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	fade() {
		this.context.globalCompositeOperation = 'destination-out';
		this.context.fillStyle = 'rgba(0, 0, 0, 0.05)';
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.globalCompositeOperation = 'lighter';
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;

		this.centerX = this.width * 0.5;
		this.centerY = this.height * 0.5;

		this.radius = Math.min(this.width, this.height) * 0.5;

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.center = { x: this.centerX, y: this.centerY };
	}

	getRandomPosition() {
		return { x: this.width * Math.random(), y: this.height * Math.random() };
	}
}

class Circle {
	constructor(position, radius) {
		this.position = {
			x: position.x,
			y: position.y,
		};

		this.radius = radius;
		this.angle = 0;

		const numArms = 11;
		const step = Math.PI * 2 / numArms;
		const radiusDecrease = 0.5;

		this.arms = new Array(numArms).fill().map((_, i) => {
			let planet = this;
			let planetRadius = this.radius * radiusDecrease;
			const armAngle = i * step;

			const arm = new Array(10).fill().map((_) => {
				const sun = new Sun(planet, planetRadius, armAngle);

				planet = sun;
				planetRadius *= radiusDecrease;

				return sun;
			});


			return arm;
		});

		this.ends = this.arms.map(arm => arm[arm.length - 1]);
	}

	update(speed) {
		this.endsFrom = this.ends.map(sun => ({ x: sun.position.x, y: sun.position.y }));

		this.angle += speed * 0.01;

		this.arms.forEach((arm, ai) => {
			arm.forEach((sun, si) => {
				const armSpeed = ai % 2 === 0 ? speed : -speed;
				const sunSpeed = si % 2 === 0 ? si : -si;
				sun.update(armSpeed * 0.01 + (0.009 * sunSpeed));
			});
		});

		this.endsTo = this.ends.map(sun => ({ x: sun.position.x, y: sun.position.y }));
	}

	draw(ctx, ctxTrail) {
		this.arms.forEach((arm) => {
			arm.forEach(sun => sun.draw(ctx));
		});

		this.endsFrom.forEach((endFrom, index) => {
			const color = '#333'; //palette[wrapArrayIndex(index, palette)];
			const endTo  = this.endsTo[index];

			ctxTrail.strokeStyle = color;
			ctxTrail.lineWidth = 1;
			ctxTrail.beginPath();
			ctxTrail.moveTo(endFrom.x, endFrom.y);
			ctxTrail.lineTo(endTo.x, endTo.y);
			ctxTrail.stroke();
			ctxTrail.closePath();
		});
	}
}

class Sun {
	constructor(planet, radius, angle = 0) {
		this.planet = planet;
		this.radius = radius;

		this.angle = angle;
		this.angleInner = angle;

		this.margin = 2;
	}

	get position() {
		const x = this.planet.position.x + (Math.cos(this.angle) * (this.planet.radius + this.radius + this.margin));
		const y = this.planet.position.y + (Math.sin(this.angle) * (this.planet.radius + this.radius + this.margin));

		return { x, y };
	}

	update(speed) {
		this.angle += speed;
	}

	draw(ctx) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;

		// ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}
}

class Scene {
	constructor(stage, stageTrail) {
		this.stage = stage;
		this.stageTrail = stageTrail;

		this.speed = 1;

		this.phase = 0;
		this.rafId = null;
	}

	reset() {
		this.stage.clear();
		this.generate();
	}

	generate() {
		const count = 1;

		this.circles = new Array(count).fill().map(() => {
			return new Circle(stage.center, 60);
		});
	}

	run() {
		this.stage.clear();

		this.circles.forEach((circle, i) => {
			circle.update(this.speed);
			circle.draw(this.stage.context, this.stageTrail.context, i);
		});

		this.phase += this.speed;
		this.rafId = requestAnimationFrame(() => this.run());
	}
}

const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const stageTrail = new Stage(document.querySelector('.js-canvas-trail'), window.innerWidth, window.innerHeight);

const scene = new Scene(stage, stageTrail);

scene.generate();
scene.run();

document.body.addEventListener('click', () => {
	scene.reset();
});
