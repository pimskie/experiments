
import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';
import './matter.js';

const stage = Utils.qs('.js-stage');
const ctxStage = stage.getContext('2d');

const fade = Utils.qs('.js-fade');
const ctxFade = fade.getContext('2d');

const {
	Engine,
	Render,
	World,
	Bodies,
	Body,
	Vector
} = Matter;

const controls = {
	ArrowUp: false,
	ArrowRight: false,
	ArrowDown: false,
	ArrowLeft: false,
};

const MAX_VELOCITY = 5;
const MAX_ROTATION = 0.1;
const ACCELERATION = MAX_VELOCITY;
let velocity = 0;

const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;

const carWidth = 50;
const carHeight = 25;

let isDriftStarted = false;
let driftAngle = 0;
let driftPath = [];

stage.width = fade.width = width;
stage.height = fade.height = height;

const engine = Engine.create();
engine.world.gravity = Vector.create();

const render = Render.create({
	element: document.body,
	engine,

	options: {
		width,
		height,
		wireframes: false,
		showAngleIndicator: true,
		showCollisions: true,
		showVelocity: true,
	},
});

const carBody = Bodies.rectangle(midX, midY, carWidth, carHeight, { density: 0.5, frictionAir: 0.08, });
const boxBody = Bodies.rectangle(midX + 200, midY, 50, 50, { density: 1000 });

World.add(engine.world, [carBody, boxBody]);

const clear = (ctx) => {
	ctx.fillStyle = 'hsla(0, 0%, 100%, 0.01)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const updateWorld = () => {
	const { angle } = carBody;
	let rotation = 0;

	const position = {
		x: carBody.position.x,
		y: carBody.position.y,
	};

	if (controls.ArrowUp) {
		velocity += ACCELERATION;
	}

	if (controls.ArrowDown) {
		velocity -= ACCELERATION;
	}

	if (controls.ArrowRight) {
		rotation = MAX_ROTATION;
	}

	if (controls.ArrowLeft) {
		rotation = -MAX_ROTATION;
	}

	if (position.x > width + 100) {
		position.x = 0;
	} else if (position.x < -100) {
		position.x = width;
	}

	if (position.y > height + 100) {
		position.y = 0;
	} else if (position.y < -100) {
		position.y = height;
	}

	velocity = Utils.clamp(velocity, -MAX_VELOCITY / 4, MAX_VELOCITY);

	// `body.speed` should be magnitude of `body.velocity` which is not true
	const velocityVector = Vector.create(Math.cos(angle) * velocity, Math.sin(angle) * velocity);
	const speed = Math.hypot(velocityVector.x, velocityVector.y);
	const velocityPercentage = speed / MAX_VELOCITY;

	Body.setPosition(carBody, position);
	Body.applyForce(carBody, carBody.position, velocityVector);
	Body.setAngularVelocity(carBody, rotation * velocityPercentage);

	velocity = 0;

	if (isDriftStarted) {
		drawDrift(ctxFade);
		driftPath.push(carBody.position);


		driftAngle += (rotation * velocityPercentage);

		if (Math.abs(driftAngle) >= Math.PI * 2) {
			const padding = 200;

			Body.setPosition(boxBody, {
				x: padding + (Math.random() * (width - padding)),
				y: padding + (Math.random() * (height - padding)),
			});

			resetDrift();
		}
	}
};

const drawCar = (ctx) => {
	ctx.save();
	ctx.translate(carBody.position.x, carBody.position.y);
	ctx.rotate(carBody.angle);

	// car
	ctx.beginPath();
	ctx.rect(-carWidth / 2, -carHeight / 2, carWidth, carHeight)
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

const drawCarTracks = (ctx) => {
	ctx.save();
	ctx.translate(carBody.position.x, carBody.position.y);
	ctx.rotate(carBody.angle);

	// tracks
	ctx.beginPath();
	ctx.arc(-carWidth / 2 + 5, -carHeight / 2 + 5, 5, 0, Math.PI * 2, false);
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

const resetDrift = () => {
	driftPath = [];
	isDriftStarted = false;
	driftAngle = 0;
};

const drawDrift = (ctx) => {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(100, 200);

	ctx.stroke();
	ctx.closePath();

	if (driftPath.length < 2) return;

	ctx.beginPath();
	ctx.moveTo(driftPath[0].x, driftPath[0].y);

	for (let i = 1; i < driftPath.length; i++) {
		const p = driftPath[i];

		ctx.lineTo(p.x, p.y);
	}

	ctx.stroke();
	ctx.closePath();
};

const loop = () => {
	ctxStage.clearRect(0, 0, ctxStage.canvas.width, ctxStage.canvas.height);
	clear(ctxFade, 1);

	updateWorld();
	drawCar(ctxStage);
	// drawCarTracks(ctxFade);

	requestAnimationFrame(loop);
};

const onControl = (e) => {
	const { type, key } = e;
	const isActive = type === 'keydown';
	const isDriftKey = key === 'ArrowRight' || key === 'ArrowLeft';

	if (isDriftKey) {
		if (!isDriftStarted && isActive) {
			resetDrift();
		}

		isDriftStarted = isActive;
	}

	controls[key] = isActive;
};

document.addEventListener('keydown', onControl);
document.addEventListener('keyup', onControl);

// GOGOGO
Engine.run(engine);
Render.run(render);
loop();
