const randomGaussian = (mean = 0, sd = 1) => {
	let y1;
	let y2;
	let x1;
	let x2
	let w;
	let previous;

	if (previous) {
		y1 = y2;
		previous = false;
	} else {
		do {
			x1 = (Math.random() * 2) - 1;
			x2 = (Math.random() * 2) - 1;
			w = x1 * x1 + x2 * x2;
		} while (w >= 1);
		w = Math.sqrt(-2 * Math.log(w) / w);
		y1 = x1 * w;
		y2 = x2 * w;
		previous = true;
	}

	return y1 * sd + mean;
};

export default randomGaussian;
