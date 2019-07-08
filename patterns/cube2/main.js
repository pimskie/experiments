import anime from '//unpkg.com/animejs@3.0.1/lib/anime.es.js';

class Stage {
	constructor(canvasSelector, width, height) {
		this.canvas = document.querySelector(canvasSelector);
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

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

const stage = new Stage('canvas', 500, 500);
const sideLength = 50;
const cols = Math.floor(stage.width / sideLength);
const rows = Math.floor(stage.height / sideLength);

const numSides = 6;
const angleStep = (Math.PI * 2) / numSides;

const mid = { x: stage.widthHalf, y: stage.heightHalf };
const legEnd = { x: mid.x + (Math.cos(angleStep / 2) * sideLength), y: mid.y + (Math.sin(angleStep / 2) * sideLength) };
const distanceX = Math.abs(legEnd.x - mid.x);
const distanceY = Math.abs(legEnd.y - mid.y);

const drawShape = (shape) => {
	const {
		x,
		y,
		opacity,
		fill,
		scale,
		angle: angleModifier = 0,
	} = shape;
	const { ctx } = stage;

	const length = sideLength * scale;

	let angle = (-Math.PI / 2) + angleModifier;

	ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
	ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.1})`;
	ctx.lineWidth = 0.5;

	ctx.beginPath();
	ctx.moveTo(x + (Math.cos(angle) * length), y + (Math.sin(angle) * length));

	for (let i = 1; i < numSides; i++) {
		angle += angleStep;

		ctx.lineTo(x + (Math.cos(angle) * length), y + (Math.sin(angle) * length));
	}

	ctx.closePath();
	ctx.stroke()

	if (fill) {
		ctx.fill();
	}
};

const createShapes = () => {
	let x = distanceX;
	let y = distanceY * 2;

	const shapes = [];

	for (let i = 0; i < rows; i += 1) {
		for (let q = 0; q < cols; q += 1) {

			shapes.push({
				x: x,
				y: y,
				scale: 0.5,
				opacity: 0,
				angle: 0,
				col: q,
				row: i,
			});

			shapes.push({
				x: x - distanceX,
				y: y - distanceY,
				scale: 0.5,
				opacity: 0,
				angle: 0,
				col: q,
				row: i,
			});

			x += distanceX * 2;
		}

		x = i % 2 === 0 ? distanceX * 2 : distanceX;
		y += distanceY * 3;
	}

	return shapes;
};

const forms = createShapes();

const fadeIn = {
	opacity: [0, 1],
	delay: anime.stagger(10),
};

const scaleLarge = {
	scale: [0.5, 2],
	duration: 1000,
};

const scaleHalf = {
	scale: [2, 1.25],
	duration: 1000,
};

const scaleDefault = {
	scale: 1,
	duration: 2000,
};

const scaleSmall = {
	scale: 0.5,
	duration: 2000,
};

anime.timeline({
	targets: forms,
	easing: 'easeOutSine',
	duration: 200,
	update: () => {
		stage.clear();
		forms.forEach(drawShape);
	},
})
.add(fadeIn)
// .add(scaleLarge)
// .add(scaleHalf)
// .add(scaleDefault)
// .add(scaleSmall)
// .add({
// 	y: (shape, index) => {
// 		return index % 3 === 0 ? shape.y + (distanceY * 3) : shape.y - distanceY;
// 	},

// 	duration: 1500,
// })
.add({ angle: Math.PI, duration: 1000 })

// const rotate = () => {
// 	anime({
// 		targets: forms,
// 		angle: Math.PI,
// 		easing: 'easeOutCirc',
// 		duration: 1000,

// 		update: () => {
// 			stage.clear();
// 			forms.forEach(form => drawShape(form));
// 		},
// 	});
// };

// const scale = () => {
// 	anime({
// 		targets: forms,
// 		scale: 0.5,
// 		easing: 'easeOutCirc',
// 		duration: 1000,

// 		update: () => {
// 			stage.clear();
// 			forms.forEach(form => drawShape(form));
// 		},

// 		complete: () => {
// 			rotate();
// 		},
// 	});
// };

// const draw = () => {
// 	anime({
// 		targets: forms,
// 		opacity: 1,
// 		easing: 'easeOutCirc',
// 		duration: 250,
// 		delay: anime.stagger(25),

// 		update: () => {
// 			stage.clear();
// 			forms.forEach(form => drawShape(form));
// 		},

// 		complete: () => {
// 			scale();
// 		},
// 	});
// };

// draw();
