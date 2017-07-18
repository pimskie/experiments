// http://natureofcode.com/book/chapter-8-fractals/

(function() {
	var canvas = document.querySelector('.js-canvas'),
		ctx = canvas.getContext('2d'),
		w,
		h;

	window.addEventListener('resize', init);
	init();

	function init() {
		w = window.innerWidth;
		h = window.innerHeight;

		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);
		ctx.clearRect(0, 0, w, h);

		var r = (w < h) ? w : h;
		r *= 0.2;

		drawCircle(w >> 1, h >> 1, r);
	}

	function drawCircle(x, y, r) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2, true);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#EBEBEB';
		ctx.stroke();
		ctx.closePath();

		if (r > 10 && x > 0 && y > 0) {
			drawCircle(x - r, y, r/2);
			drawCircle(x + r, y, r/2);
			drawCircle(x, y + r, r/2);
			drawCircle(x, y - r, r/2);
		}
	}
})();