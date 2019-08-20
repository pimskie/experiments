const simplex = new SimplexNoise(0.3);
const TAU = Math.PI * 2;

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
  constructor(position, index, lightness) {
    const { x, y } = position;

    this.position = { x, y };
    this.positionPrevious = { x, y };
		this.index = index;
		this.lightness = lightness;

    this.length = 1;

    this.phase = this.index * 0.01;
    this.speed = 0.001;
  }

  update() {
    const volatilityX = 0.002;
    const volatilityY = 0.001;
    const multiplier = 1;

    const noise = simplex.noise2D(this.phase, this.position.y * volatilityY, this.phase) * multiplier;

    const velocity = {
      x: 1, //  Math.cos(noise * Math.PI) * this.length,
      y: Math.sin(noise * (Math.PI / 2)) * this.length,
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

  draw(point) {
    const { context } = this.stage;
    const { position, positionPrevious, lightness } = point;

    context.save();
		context.beginPath();
		context.lineWidth = 5;
		context.strokeStyle = `hsl(0, 100%, ${40 + lightness}%)`;
    context.moveTo(positionPrevious.x, positionPrevious.y);
    context.lineTo(position.x, position.y);
    context.stroke();
    context.closePath();
  }

  run() {
    this.segments.forEach((s) => {
      s.update();
      this.draw(s);
    });

    this.rafId = requestAnimationFrame(() => this.run());
  }
}

const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const scene = new Scene(stage, 20);
scene.generate();
scene.run();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});

document.body.addEventListener('click', () => {
  scene.reset();
});
