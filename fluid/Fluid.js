// x and x0 are arrays
// Gauss-Seidel relaxation of course
const linearResolve = (b, x, x0, a, c, iterations, N) => {
	const cRecip = 1.0 / c;

    for (let k = 0; k < iterations; k++) {
		for (let j = 1; j < N - 1; j++) {
			for (let i = 1; i < N - 1; i++) {
				x[IX(i, j)] =
					(x0[IX(i, j)]
						+ a*(    x[IX(i+1, j    )]
								+x[IX(i-1, j    )]
								+x[IX(i  , j+1  )]
								+x[IX(i  , j-1  )]
						)) * cRecip;
			}
		}

        set_bnd(b, x, N);
    }
}

const IX = (x, y, N) => {
	return (x + y * N);
}

// x and x0 are arrays
const diffuse = (b, x, x0, diff, dt, iterations, N) => {
	const a = dt * diff * (N - 2) * (N - 2);
	const c = 4 * a;

	linearResolve(b, x, x0, a, c, iterations, N);
};

class Fluid {
	constructor({ N, dt, diffusion, viscosity }) {
		this.size = N;

		this.dt = dt;
		this.diffusion = diffusion;
		this.viscosity = viscosity;

		this.density = new Array(N * N);
		this.density0 = new Array(N * N);

		this.velocityX = new Array(N * N);
		this.velocityX0 = new Array(N * N);

		this.velocityY = new Array(N * N);
		this.velocityY0 = new Array(N * N);
	}

	addDensity(x, y, amount) {
		const index = IX(x, y, this.size);

		this.density[index] += amount;
	}

	addVelocity(x, y, amountX, amountY) {
		const index = IX(x, y, this.size);

		this.velocityX[index] += amountX;
		this.velocityY[index] += amountY;
	}
}

export default Fluid;
