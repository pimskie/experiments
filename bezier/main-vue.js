const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

// all set in `setStage`
const w = 500;
const h = 500;
const wh = w * 0.5;
const hh = h * 0.5;

canvas.width = w;
canvas.height = h;

const offset = 55;
const amp = 100;
const width = offset + amp;
const height = 150;
const halfHeight = height * 0.5;


const clear = (c) => {
	c.clearRect(0, 0, c.canvas.width, c.canvas.height);
};


const instance = new Vue({
	el: '.js-container',

	data() {
		return {
			shape: {
				startX: 10,
				startY: -halfHeight,

				cp1x: 100,
				cp1y: 0,
				cp2x: -30,
				cp2y: halfHeight,
				endX1: -20,
				endY1: halfHeight,

				cp3x: -100,
				cp3y: 0,
				cp4x: 0,
				cp4y: halfHeight - 50,
				endX2: 10,
				endY2: -halfHeight,
			},
		};
	},

	watch: {
		shape: {
			handler() {
			},

			deep: true,
		},
	},


	directives: {
		draw(el, binding) {
			const c = el.getContext('2d');
			const shape = binding.value;

			c.strokeStyle = '#fff';
			c.fillStyle = 'red';

			clear(c);

			// // anchor left top
			// // ctx.beginPath();
			// // ctx.fillStyle = grad;
			// // ctx.moveTo(offset, 0);
			// // ctx.bezierCurveTo(width, 90, offset - 60, 100, offset - 20, height);
			// // ctx.bezierCurveTo(offset - 120, 65, offset + 30, 50, offset, 0);

			// anchor mid mid
			c.save();
			c.translate(wh, hh);

			c.beginPath();
			c.moveTo(shape.startX, shape.startY);
			c.bezierCurveTo(shape.cp1x, shape.cp1y, shape.cp2x, shape.cp2y, shape.endX1, shape.endY1);
			c.bezierCurveTo(shape.cp3x, shape.cp3y, shape.cp4x, shape.cp4y, shape.endX2, shape.endY2);
			c.stroke();
			c.closePath();

			c.beginPath();
			c.fillStyle = '#fff';
			c.rect(-5, -5, 10, 10);
			c.fill();
			c.closePath();
			c.restore();

		},
	},
});


// const loop = () => {
// 	clear();

// 	requestAnimationFrame(loop);
// };

// loop();
ctx.strokeStyle = '#fff';
ctx.fillStyle = 'red';

ctx.fillRect(10, 10, 100, 100);

ctx.beginPath();
ctx.arc(100, 100, 10, 0, Math.PI * 2, false);
ctx.fill();
ctx.closePath();
