// https://en.wikipedia.org/wiki/Smoothed-particle_hydrodynamics
// https://github.com/Erkaman/gl-water2d
// https://www.cs.cornell.edu/~bindel/class/cs5220-f11/code/sph.pdf - rood
// http://image.diku.dk/projects/media/kelager.06.pdf
// https://www.cs.ubc.ca/~rbridson/fluidsimulation/fluids_notes.pdf
// http://www.ligum.umontreal.ca/Clavet-2005-PVFS/pvfs.pdf

const qs = (sel) => document.querySelector(sel);

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;

// all set in `setStage`
const dim = 400;
let width = dim;
let height = dim;

canvas.width = width;
canvas.height = height;

const h = 50;// smoothing length
const mass = 1;

const particleR = 10;
const particleSpacing = 10;

const numParticles = Math.floor(width / ((particleR * 2) + particleSpacing));

const particles = [];

for (let i = 0; i < numParticles; i++) {
	const x = particleR + (particleSpacing * i) + (particleR * 2) * i;
	const y = particleR;

	particles.push({
		position: { x, y },
		radius: particleR,
		density: 0,
		acceleration: { x: 0, y: 0 },
		mass,
		h,
	});
}

const draw = () => {
	particles.forEach((p) => {
		ctx.beginPath();
		ctx.arc(p.position.x, p.position.y, p.radius, 0, PI * 2);
		ctx.stroke();
		ctx.closePath();
	});
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	draw();
	requestAnimationFrame(loop);
};

loop();
