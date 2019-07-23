const IX = (x, y, N) => {
	return (x + y * N);
}

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

const project = (velocX, velocY, p, div, iterations, N) => {
	for (var j = 1; j < N - 1; j++) {
		for (var i = 1; i < N - 1; i++) {
			div[IX(i, j)] = -0.5 * (
						velocX[IX(i+1, j  )]
					-velocX[IX(i-1, j  )]
					+velocY[IX(i  , j+1)]
					-velocY[IX(i  , j-1)]
				)/N;
			p[IX(i, j, k)] = 0;
		}
	}

	set_bnd(0, div, N);
	set_bnd(0, p, N);

	linearResolve(0, p, div, 1, 6, iterations, N);

	for (var j = 1; j < N - 1; j++) {
		for (var i = 1; i < N - 1; i++) {
			velocX[IX(i, j)] -= 0.5 * (  p[IX(i+1, j)]
											-p[IX(i-1, j)]) * N;
			velocY[IX(i, j)] -= 0.5 * (  p[IX(i, j+1)]
											-p[IX(i, j-1)]) * N;
		}
	}

	set_bnd(1, velocX, N);
	set_bnd(2, velocY, N);
}

const advect = (b, d, d0,  velocX, velocY, dt, N) => {
    let i0, i1, j0, j1, k0, k1;

    let dtx = dt * (N - 2);
    let dty = dt * (N - 2);
    let dtz = dt * (N - 2);

    let s0, s1, t0, t1, u0, u1;
    let tmp1, tmp2, tmp3, x, y, z;

    let Nfloat = N;
    let ifloat, jfloat;
    let i, j;

	for(j = 1, jfloat = 1; j < N - 1; j++, jfloat++) {
		for(i = 1, ifloat = 1; i < N - 1; i++, ifloat++) {
			tmp1 = dtx * velocX[IX(i, j)];
			tmp2 = dty * velocY[IX(i, j)];
			x    = ifloat - tmp1;
			y    = jfloat - tmp2;

			if(x < 0.5) x = 0.5;
			if(x > Nfloat + 0.5) x = Nfloat + 0.5;
			i0 = Math.floor(x);

			i1 = i0 + 1.0;
			if(y < 0.5) y = 0.5;
			if(y > Nfloat + 0.5) y = Nfloat + 0.5;
			j0 = Math.floor(y);
			j1 = j0 + 1.0;

			s1 = x - i0;
			s0 = 1.0 - s1;
			t1 = y - j0;
			t0 = 1.0 - t1;

			let i0i = i0;
			let i1i = i1;
			let j0i = j0;
			let j1i = j1;

			d[IX(i, j)] =
				s0 * ( t0 * d0[IX(i0i, j0i)])
					+( t1 * d0[IX(i0i, j1i)])
				+s1 * ( t0 * d0[IX(i1i, j0i)])
					+( t1 * d0[IX(i1i, j1i)]);
		}
	}

    set_bnd(b, d, N);
}

// x and x0 are arrays
const diffuse = (b, x, x0, diff, dt, iterations, N) => {
	const a = dt * diff * (N - 2) * (N - 2);
	const c = 4 * a;

	linearResolve(b, x, x0, a, c, iterations, N);
};

const set_bnd = (b, x, N) => {
    for(let k = 1; k < N - 1; k++) {
        for(let i = 1; i < N - 1; i++) {
            x[IX(i, 0)] = b == 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
            x[IX(i, N-1)] = b == 2 ? -x[IX(i, N-2)] : x[IX(i, N-2)];
        }
    }
    for(let k = 1; k < N - 1; k++) {
        for(let j = 1; j < N - 1; j++) {
            x[IX(0  , j)] = b == 1 ? -x[IX(1  , j)] : x[IX(1  , j)];
            x[IX(N-1, j)] = b == 1 ? -x[IX(N-2, j)] : x[IX(N-2, j)];
        }
    }

    x[IX(0, 0, 0)]       = 0.33* (x[IX(1, 0, 0)]
                                  + x[IX(0, 1, 0)]
                                  + x[IX(0, 0, 1)]);
    x[IX(0, N-1, 0)]     = 0.33* (x[IX(1, N-1, 0)]
                                  + x[IX(0, N-2, 0)]
                                  + x[IX(0, N-1, 1)]);
    x[IX(0, 0, N-1)]     = 0.33* (x[IX(1, 0, N-1)]
                                  + x[IX(0, 1, N-1)]
                                  + x[IX(0, 0, N)]);
    x[IX(0, N-1, N-1)]   = 0.33* (x[IX(1, N-1, N-1)]
                                  + x[IX(0, N-2, N-1)]
                                  + x[IX(0, N-1, N-2)]);
    x[IX(N-1, 0, 0)]     = 0.33* (x[IX(N-2, 0, 0)]
                                  + x[IX(N-1, 1, 0)]
                                  + x[IX(N-1, 0, 1)]);
    x[IX(N-1, N-1, 0)]   = 0.33* (x[IX(N-2, N-1, 0)]
                                  + x[IX(N-1, N-2, 0)]
                                  + x[IX(N-1, N-1, 1)]);
    x[IX(N-1, 0, N-1)]   = 0.33* (x[IX(N-2, 0, N-1)]
                                  + x[IX(N-1, 1, N-1)]
                                  + x[IX(N-1, 0, N-2)]);
    x[IX(N-1, N-1, N-1)] = 0.33* (x[IX(N-2, N-1, N-1)]
                                  + x[IX(N-1, N-2, N-1)]
                                  + x[IX(N-1, N-1, N-2)]);
}
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
