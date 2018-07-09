// http://deconbatch.blogspot.com/2018/06/sleeping-with-television-on.html

const c = document.querySelector('.js-canvas');
const ctx = c.getContext('2d');

const width = 750;
const height = 750;

const widthHalf = width * 0.5;
const heightHalf = height * 0.5;

c.width = width;
c.height = height;

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const draw = () => {
	ctx.clearRect(0, 0, width, height);

	const hue = Math.round(Math.random() * 360);
	const shapes = 3;
	const total = 1000;

	ctx.save();
	ctx.translate(widthHalf, heightHalf);

	for (let shape = 0; shape < shapes; shape++) {
		const noise = Math.random() * Math.PI;

		for (let count = 0; count < total; count++) {
			const radian = Math.PI * noise * count / 100;
			// const x = widthHalf * Math.cos(radian * Math.sin(noise));
			const x = widthHalf * Math.cos(radian * noise);
			const y = heightHalf * Math.sin(radian + count * 0.001);

			const radius = 1; // + (Math.random() * 6);

			ctx.beginPath();
			ctx.fillStyle = `hsl(${hue}, 40%, 50%)`;

			ctx.arc(x, y, radius, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.closePath();
		}
	}

	ctx.restore();
};


draw();

c.addEventListener('click', draw);
