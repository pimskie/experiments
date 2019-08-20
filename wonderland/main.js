const simplex = new SimplexNoise(0.3);
const TAU = Math.PI * 2;

// const PALETTE = ['#FF9F1C', '#ffbf69', '#ffffff', '#cbf3f0', '#2ec4b6'];
// const PALETTE = ['#c5f0a4', '#35b0ab', '#226b80', '#f34573'];
const PALETTE = [
	[94, 72, 79],
	[178, 54, 45],
	[193, 58, 32],
	[344, 88, 61],
];

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

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

class Segment {
  constructor(position, index) {
    const { x, y } = position;

    this.position = { x, y };
    this.positionPrevious = { x, y };
		this.index = index;

    this.length = 2;

    this.phase = this.index * 0.001;
		this.speed = 0.001;

		this.acceleration = { x: 0, y: 0 };
	}

	applyForce(force) {

	}

  update() {
    const volatilityX = 0.0001;
    const volatilityY = 0.0005;

    const noise = simplex.noise3D(this.position.x * volatilityX, this.position.y * volatilityY, this.phase);
		const angleX = clamp(noise * Math.PI, -Math.PI / 2, Math.PI / 2);

    const velocity = {
      x: Math.cos(angleX) * this.length,
      y: Math.sin(noise * (Math.PI)) * this.length,
    };

    this.positionPrevious.x = this.position.x;
    this.positionPrevious.y = this.position.y;

    this.position.x += velocity.x;
    this.position.y += velocity.y;

    this.phase += this.speed;
	}
}

class Scene {
  constructor(stage,numSegments) {
    this.stage = stage;
		this.numSegments = numSegments;
    this.segmentSpacing = this.stage.height / this.numSegments;

    this.segments = [];
		this.rafId = null;

		this.forces = [
			{
				position: { x: this.stage.width * 0.25, y: 0 },
				direction: { x: 1, y: 1 },
			},
			{
				position: { x: this.stage.centerX, y: this.stage.height },
				direction: { x: 1, y: -1 },
			}
		];
  }

  reset() {
    this.stage.clear();
    this.generate();
  }

  generate() {
		const { stage: { centerY } } = this;

    this.segments = new Array(this.numSegments).fill().map((_, i) => {
			const x = 25;
			const y = i * this.segmentSpacing;
			const percentCenterY = Math.abs((y - centerY) / centerY);
			const lightness = 50 * percentCenterY;

      return new Segment({ x, y }, i, lightness);
    });
  }

	connect(from, to, [h, s, l]) {
		const { positionPrevious: topLeft, position: topRight } = from;
		const { positionPrevious: bottomLeft, position: bottomRight } = to;
		const { context } = this.stage;
		const color = `hsl(${h}, ${s}%, ${l}%)`;

		context.beginPath();
		context.strokeStyle = color;
		context.fillStyle = color;
		context.moveTo(topLeft.x, topLeft.y);
		context.lineTo(topRight.x, topRight.y);
		context.lineTo(bottomRight.x, bottomRight.y);
		context.lineTo(bottomLeft.x, bottomLeft.y);
		context.lineTo(topLeft.x, topLeft.y);
		context.stroke();
		context.fill();
		context.closePath();
	}

  run() {
    for (let i = 0; i < this.segments.length; i++) {
			const segment = this.segments[i];

			segment.applyForce(this.forces[0]);
			segment.update();

			if (i < this.segments.length - 1) {
				const segmentNext = this.segments[i + 1];
				const colorIndex = (i + 1 + PALETTE.length) % PALETTE.length;
				const hsl = PALETTE[colorIndex];

				this.connect(segment, segmentNext, hsl);
			}
		}

    this.rafId = requestAnimationFrame(() => this.run());
  }
}

const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const scene = new Scene(stage, 100);
scene.generate();
scene.run();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
	scene.reset();
});

document.body.addEventListener('click', () => {
  scene.reset();
});
