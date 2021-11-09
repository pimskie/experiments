const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const wrappBBox = (vec, w, h, i) => {
	if (vec.x < 0) {
		vec.x = w;
		vec.i += 1;
	} else if (vec.x > w) {
		vec.x = 0;
		vec.i += 1;
	}


	if (vec.y < 0) {
		vec.y = h;
		vec.i += 1;
	} else if (vec.y > h) {
		vec.y = 0;
		vec.i += 1;
	}
}

const W = 350;
const H = W;

const COLS = 20;
const ROWS = COLS;
const COLW = W / COLS;
const ROWH = H / ROWS;

const NUM_LINES = 50;

const simplex = new SimplexNoise(performance.now());
const ctx = document.querySelector('.js-lines').getContext('2d');

const trailer = {
	x: 0,
	y: H * 0.5,
	v: 1,
	i: 0,
};

ctx.canvas.width = W;
ctx.canvas.height = H;

const getNoiseValue = (x, y, i = 1) => {
	const scale = 0.07;

	return simplex.noise3D(x * scale, y * scale, i * 0.1);
};


const clear = () => {
	ctx.clearRect(0, 0, W, H);
};


const drawLines = () => {
	const DETAIL = 50;
	const spaceX = W / DETAIL;
	const spaceY = H / NUM_LINES;

	for (let y = 0; y < NUM_LINES; y++) {
		const posY = (y * spaceY) + spaceY;

		ctx.beginPath();

		for (x = 0; x < DETAIL; x++) {
			const posX = (x * spaceX) + spaceX;
			const ampY = getNoiseValue(x, y) * 50;

			if (x === 0) {
				ctx.moveTo(posX, posY + ampY);
			} else {
				ctx.lineTo(posX, posY + ampY);
			}
		}

		ctx.stroke();
		ctx.closePath();
	}
};

const draw = () => {
	clear();
	drawLines();

	requestAnimationFrame(draw);
};

draw();
