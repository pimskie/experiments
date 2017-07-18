(function () {
    'use strict';

    window.requestAnimationFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	var hasStats = false;

	if (typeof Stats !== 'undefined') {
		hasStats = true;
		var stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.right = '0px';
		stats.domElement.style.bottom = '0px';
		document.body.appendChild( stats.domElement );
	}

	var TO_RADIAN = Math.PI / 180,
		TO_DEGREE = 180 / Math.PI,
		TWO_PI = Math.PI * 2,
		canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		cW = window.innerWidth,
		cH = window.innerHeight,
		particles = [],
		mouseX = 0,
		mouseY = 0,
		circleRadius = 10,
		circleAngle = 0,
		circleSpeed = 0.01,
		circlePosX = 0,
		circlePosY = 0,
		pixelData,
		pixels,
		gui;

	var ParticleOptions = function() {
		this.maxParticles = 20000;
		this.a = 1.4;
		this.b = 1.6;
		this.c = 1;
		this.d = 0.7;
		this.width = 150;
	};

	var particleOptions = new ParticleOptions();

	function randomBetween(min, max, round) {
		var rand = Math.random()*(max-min+1)+min;
		if (round === true) {
			return Math.floor(rand);
		} else {
			return rand;
		}
	}

	// http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
	function hslToRgb(h, s, l) {
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    } else {
	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }

	    return [r * 255, g * 255, b * 255];
	}

	 function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

	function distanceBetween (x1, y1, x2, y2) {
		var dx = x2 - x1,
			dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	}

	function angleBetween (x1, y1, x2, y2) {
    	return Math.atan2(y2 - y1, x2 - x1);
	}

	function initGui () {
		var gui = new dat.GUI();
		gui.add(particleOptions, 'maxParticles', 1, 50000).step(100).onFinishChange(createStarfield);
		gui.add(particleOptions, 'a', 1, 5).onFinishChange(createStarfield);
		gui.add(particleOptions, 'b', -0.5, 5).onFinishChange(createStarfield);
		gui.add(particleOptions, 'c', -0.5, 6).onFinishChange(createStarfield);
		gui.add(particleOptions, 'd', -0.5, 6).onFinishChange(createStarfield);
	}


	function mouseMovehandler (e) {
		mouseX = e.x;
		mouseY = e.y;
	}

	function Particle (fromX, fromY, toX, toY, index) {
		this.fromX = fromX;
		this.fromY = fromY;
		this.toX = toX;
		this.toY = toY;
		this.endX = Math.round((cW * 0.5) + (this.toX * particleOptions.width));
		this.endY = Math.round((cH * 0.5) + (this.toY * particleOptions.width));
		this.speed = randomBetween(10, 40);

		var dis = distanceBetween((cW * 0.5), (cH * 0.5), this.endX, this.endY);
		this.x = this.fromX;
		this.y = this.fromY;

		this.nextX = Math.sin(particleOptions.a*this.toY) + particleOptions.c*Math.cos(particleOptions.a*this.toX);
		this.nextY = Math.sin(particleOptions.b*this.toX) + particleOptions.d*Math.cos(particleOptions.b*this.toY);
	}


	Particle.prototype.erase = function (i) {
		var index = ( ( this.x | 0 ) + ( this.y | 0 ) * cW ) * 4;
		pixels[index + 3] = 0;
	}

	Particle.prototype.update = function (i, x1) {
		this.x += (this.endX - this.x) / this.speed ;
		this.y += (this.endY - this.y) / this.speed;

		//this.x += x1;
	}

	Particle.prototype.draw = function (i) {
		var index = ( ( this.x | 0 ) + ( this.y | 0 ) * cW ) * 4;
		pixels[index] = 255
		pixels[index + 1] = 0;
		pixels[index + 2] = 0;
		pixels[index + 3] = 255;
	}

	function createStarfield()  {
		// set canvas size
		cW = window.innerWidth;
		cH = window.innerHeight;

		canvas.width = cW;
		canvas.height = cH;

		// create new imageData
		pixelData = ctx.createImageData(cW, cH);
		pixels = pixelData.data;

		// reset particles array
		particles = [];

		// and create
		var i = particleOptions.maxParticles,
			toX = 0,
			toY = 0,
			fromX,
			fromY,
			particle;

		while (i--) {
			fromX = randomBetween(1, cW, true);
			fromY = randomBetween(1, cH, true);
			particle = new Particle(fromX, fromY, toX, toY, i);
			particles.push(particle);
			toX = particle.nextX;
			toY = particle.nextY;
		}
	}


	function init () {
		canvas.addEventListener('mousemove', mouseMovehandler);
		initGui();
		createStarfield();
		loop();
	}


	function loop () {
		if (hasStats) stats.begin();
		requestAnimationFrame(loop);
		var i = particles.length,
			particle;

		circlePosX = Math.cos(circleAngle) * circleRadius;
		circleAngle += circleSpeed;

		while (i--) {
			particle = particles[i];
			particle.erase(i);
			particle.update(i, circlePosX);
			particle.draw(i);
		}

		ctx.putImageData(pixelData, 0, 0);
		if (hasStats) stats.end();
	}

	window.onload = function () {
		init();

		window.addEventListener('resize', function () {
			createStarfield( );
		});
	}

})();