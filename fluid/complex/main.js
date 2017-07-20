const qs = (sel) => document.querySelector(sel);

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');

const N = 200;

canvas.width = N;
canvas.height = N;

// the `+ 2` seems to be for boundries
const size = (N + 2) * (N + 2);
const timestamp = 0.001;
const diffusion = 0.0012;
const viscocity = 0.0012;


const u = new Array(size); // velocity X
const v = new Array(size); // velocity Y
const density = new Array(size);

// initialize everything to zero
for (let i = 0; i < size; i++) {
	u[i] = 0;
	v[i] = 0;
	density[i] = 0;
}

//v alues from the last step
const uPrev = u.slice();
const vPrev = v.slice();
const densityPrev = density.slice();

const IX = (i, j) => {
	return ((i) + (N + 2) * (j));
};

const addSource = (x, s, dt) => {
	for (let i = 0; i < size; i++) {
		x[i] += dt * s[i];
	}
};

const diffuse = (b, x, x0, diff, dt) => {
	const a = dt * diff * N * N;

	// // bad version
	// for (let i = 1; i <= N; i++) {
	// 	for (let j = 1; j < N; j++) {
	// 		x0[IX(i, j)] = x[IX(i, j)] - a * (x[IX(i-1, j)] + x[IX(i+1, j)] + x[IX(i, j - 1)] + x[IX(i, j + 1)] - 4 * x[IX(i, j)]);
	// 	}
	// }

	for (let k = 0; k < 20; k++) {
		for (let i = 1; i <= N; i++) {
			for (let j = 1; j < N; j++) {
				x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i - 1, j)] + x[IX(i + 1, j)] + x[IX(i, j - 1)] + x[IX(i, j + 1)])) /  (1 + 4 * a);
			}
		}

		setBoundries(b, x);
	}
};

const advect = (b, d, d0, u, v, dt) => {
	const dt0 = dt * N;

	for (let i = 1; i <= N; i++) {
		for (let j = 1; j <= N; j++) {
			let x = i - dt0 * u[IX(i, j)];
			let y = j - dt0 * v[IX(i, j)];

			if (x < 0.5) {
				x = 0.5;
			}

			if (x > N + 0.5) {
				x = N + 0.5;
			}

			let i0 = x;
			let i1 = i0 + 1;

			if (y < 0.5) {
				y = 0.5;
			}

			if (y > N + 0.5) {
				y = N + 0.5;
			}

			let j0 = y;
			let j1 = j0 + 1;

			let s1 = x - i0;
			let s0 = 1 - s1;

			let t1 = y - j0;
			let t0 = 1 -t1;

			d[IX(i, j)] = s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) + s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
		}
	}

	setBoundries(b, d);
};

const densStep = (x, x0, u, v, diff, dt) => {
	addSource(x, x0, dt);

	swap(x0, x);
	diffuse(0, x, x0, diff, dt);

	swap(x0, x);
	advect(0, x, x0, u, v, dt);
};

const velStep = (u, v, u0, v0, visc, dt) => {
	addSource(u, u0, dt);
	addSource(v, v0, dt);

	swap(u0, u);
	diffuse(1, u, u0, visc, dt);

	swap(v0, v);
	diffuse(2, v, v0, visc, dt);

	project(u, v, u0, v0);

	swap(u0, u);
	swap(v0, v);

	advect(1, u, u0, u0, v0, dt);
	advect(2, v, v0, u0, v0, dt);

	project(u, v, u0, v0);
};

const project = (u, v, p, div) => {
	const h = 1 / N;

	for (let i = 1; i <= N; i++) {
		for (let j = 1; j <= N; j++) {
			div[IX(i, j)] = -0.5 * h * (u[IX(i, j)] - u[IX(i - 1, j)] + v[IX(i, j + 1)] - v[IX(i, j - 1)])

			p[IX(i, j)] = 0;
		}
	}

	setBoundries(0, div);
	setBoundries(0, p);

	for (let k = 0; k < 20; k++) {
		for (let i = 1; i <= N; i++) {
			for (let j = 1; j <= N; j++) {
				p[IX(i, j)] = (div[IX(i, j)] + p[IX(i - 1, j)] + p[IX(i, j)] + p[IX(i, j - 1)] + p[IX(i, j + 1)]) / 4;

			}
		}

		setBoundries(0, p);
	}

	for (let i = 1; i <= N; i++) {
		for (let j = 1; j <= N; j++) {
			u[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) / h;
			v[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) / h;
		}
	}

	setBoundries(1, u);
	setBoundries(2, u);
};

const swap = (x0, x) => {
	const temp = x0;

	x0 = x;
	x = temp;
};

const draw = () => {

};

const setBoundries = (b, x) => {

	for (let i = 1 ; i <= N ; i++) {
		x[IX(0, i)] = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
		x[IX(N + 1, i)] = b === 1 ? -x[IX(N, i)] : x[IX(N, i)];
		x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
		x[IX(i,N+1)] = b ===2 ? -x[IX(i, N)] : x[IX(i, N)];
	}

	x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
	x[IX(0, N + 1)] = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
	x[IX(N + 1, 0)] = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
	x[IX(N + 1, N+1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
};

const diff = 0.5;

const loop = () => {
	requestAnimationFrame(loop);

	velStep(u, v, uPrev, vPrev, viscocity, timestamp);
	densStep(density, densityPrev, u, v, diff, timestamp);

	draw();
};


loop();
