const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;
let phase = 0;

const width = window.innerWidth;
const height = window.innerHeight;
const midX = width >> 1;
const midY = height >> 1;

const ORBIT_DAYS_EARTH = 365.256;
const ORBIT_SCALE = 0.02;

const DISTANCE_EARTH = 149598262;
const DISTANCE_SCALE = 50;

const RADIUS_EARTH = 6378.1366;
const RADIUS_SCALE = 2;

canvas.width = width;
canvas.height = height;

const phaseSpeed = 0.02;

let count = 0;

(async () => {
	const { bodies } = await fetch('https://api.le-systeme-solaire.net/rest/bodies/').then(res => res.json());

	const planetsAroundSun = bodies
		.filter(body => body.aroundPlanet === null && body.isPlanet)
		.map((body) => {
			const { name } = body;
			const moons = bodies.filter(body => body.aroundPlanet && body.aroundPlanet.planet.toLowerCase() === name.toLowerCase());
			const aroundBody = { position: { x: 0, y: 0 } };
			return { ...body, aroundBody, moons };
		});

	planetsAroundSun.sort((a, b) => a.semimajorAxis - b.semimajorAxis);

	const draw = (aroundBody, body) => {
		updateBody(aroundBody, body);
		drawBody(body);

		if (body.moons) {
			body.moons.forEach((moon) => {
				draw(body, moon);
			});
		}
	};

	const updateBody = (aroundBody, body) => {
		const { currentAngle = body.inclination, sideralOrbit, semimajorAxis, equaRadius, isPlanet } = body;
		const orbitSpeed = (ORBIT_DAYS_EARTH / sideralOrbit) * ORBIT_SCALE;
		const radius = Math.max(1, equaRadius / RADIUS_EARTH * RADIUS_SCALE);
		let length = (semimajorAxis / DISTANCE_EARTH) * DISTANCE_SCALE;

		if (!isPlanet) {
			length += aroundBody.radius + 5;
		}

		const x = aroundBody.position.x + (Math.cos(currentAngle) * length);
		const y = aroundBody.position.y + (Math.sin(currentAngle) * length);


		body.position = { x, y };
		body.radius = radius;
		body.currentAngle = currentAngle + orbitSpeed;
	};

	const drawBody = (planet) => {
		const { position, radius, color = '#fff' } = planet;

		ctx.save();
		ctx.translate(midX, midY);

		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.arc(position.x, position.y, radius, 0, TAU, false);
		ctx.fill();
		ctx.closePath();

		ctx.restore();

		count++;
	};

	const loop = () => {
		count = 0;

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		planetsAroundSun.forEach((planet) => {
			draw(planet.aroundBody, planet);
		});

		phase += phaseSpeed;

		requestAnimationFrame(loop);
	};

	loop();
})();
