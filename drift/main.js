
import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';
import './matter.js';

const {
	Engine,
	Render,
	World,
	Bodies,
	Body,
	Composite,
	Vector
} = Matter;

const controls = {
	ArrowUp: false,
	ArrowRight: false,
	ArrowDown: false,
	ArrowLeft: false,
};

const MAX_VELOCITY = 20;
const MAX_ROTATION = 0.05;
const ACCELERATION = 20;
let velocity = 0;

const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;

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

const carBody = Bodies.rectangle(midX, midY, 100, 50, { density: 1, frictionAir: 0.08, });
const boxBody = Bodies.rectangle(midX + 200, midY, 50, 50, { density: 1000 });
const wheel = Bodies.rectangle(0, 0, 20, 10);

const composite = Composite.create();
Composite.add(composite, wheel);

World.add(engine.world, [carBody, boxBody, composite]);

const loop = () => {
	const { angle, speed } = carBody;
	const angleJustified = angle; //  - Math.PI / 2;
	const velocityPercentage = speed / 10;
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

	Body.setPosition(carBody, position)

	Body.applyForce(carBody, carBody.position, Vector.create(
		Math.cos(angleJustified) * velocity,
		Math.sin(angleJustified) * velocity,
	));

	Body.setAngularVelocity(carBody, rotation * velocityPercentage);

	velocity = 0;

	requestAnimationFrame(loop);
};

/*
Body.setAngle(car, 0);

Body.setVelocity(car, Vector.create(
	Math.cos(car.angle - (Math.PI / 2)) * 10,
	Math.sin(car.angle - (Math.PI / 2)) * 10,
));
*/


const onControl = (e) => {
	const { type, key } = e;
	const isActive = type === 'keydown';

	controls[key] = isActive;
};

document.addEventListener('keydown', onControl);
document.addEventListener('keyup', onControl);

// GOGOGO
Engine.run(engine);
Render.run(render);
loop();
