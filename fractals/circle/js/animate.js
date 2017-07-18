// http://natureofcode.com/book/chapter-8-fractals/

(function() {
	var canvas = document.querySelector('.js-canvas'),
		ctx = canvas.getContext('2d'),
		circles = [],
		w,
		h;

	window.addEventListener('resize', init);
	init();

	function init() {
		w = window.innerWidth;
		h = window.innerHeight;
		circles = [];

		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);
		ctx.clearRect(0, 0, w, h);

		var r = (w < h) ? w : h;
		r *= 0.2;

		createCircle(w >> 1, h >> 1, r);
		loop();
	}

	function createCircle(x, y, r) {
		circles.push({
			x: w >> 1,
			y: h >> 1,
			r: 0.1,
			endX: x,
			endY: y,
			endR: r
		});
		

		if (r > 10 && x > 0 && y > 0) {
			createCircle(x - r, y, r/2);
			createCircle(x + r, y, r/2);
			createCircle(x, y + r, r/2);
			createCircle(x, y - r, r/2);
		}
	}

	function loop() {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, w, h);

		var i = circles.length,
			speed,
			c;

		while (i--) {
			speed = 2 + (i / 20);

			c = circles[i];
			c.x += (c.endX - c.x) / speed;
			c.y += (c.endY - c.y) / speed;
			c.r += (c.endR - c.r) / speed;

			ctx.beginPath();
			ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#EBEBEB';
			ctx.stroke();
			ctx.closePath();
		}
		window.requestAnimationFrame(loop);
	}
})();