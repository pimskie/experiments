(function($) {
	var is_chrome = window.chrome;
	/*if ( ! is_chrome) {
		$('body').addClass('no-chrome');
		return;
	}
*/


    var c 		= document.getElementById('canvas'),
    	ctx 	= c.getContext('2d'),

     	// result canvas
     	c2 		= document.getElementById('canvas_copy'),
    	ctx2 	= c2.getContext('2d'),

    	// sliced canvas
    	c3 		= document.getElementById('canvas_slice'),
    	ctx3 	= c3.getContext('2d'),
    	w		= c.width,
    	h 		= c.height,

    	// max distance for mouse
    	maxDist 	= Math.sqrt((Math.pow(w, 2) + Math.pow(w, 2))),
    	maxForce 	= 30,
    	tileW 		= 20,
    	tileH 		= tileW,
    	tiles		= [],
    	grow 		= 1,
    	RAD 		= 180 / Math.PI,

    	r		= 0,
    	g		= 0,
    	b		= 0,

    	overbright 	= 1,
    	contrast 	= 0,
    	midX		= w >> 1,
    	midY 		= h >> 1,
    	imageData 	= null,
    	data 		= null;

    // load image
	var imageObj = new Image();
	imageObj.onload = function() {
		drawImage(this);
	};
	imageObj.src = 'lib/img/img.jpg';

	// draw image on canvas
	function drawImage(imgObj) {
		ctx.drawImage( imgObj, 0, 0, w, h);
		updateImage();
	}

	function updateImage() {
		imageData 	= ctx.getImageData(0, 0, w, h);
		data 		= imageData.data;

		// manipulate original pixels and copy to canvas_copy
		for ( var i = 0; i < data.length; i += 4) {
			// substract color by percentage
			data[i] 	= (data[i] * r)  * overbright - contrast; 		// r
			data[i + 1] = (data[i + 1] * g) * overbright - contrast;	// g
			data[i + 2] = (data[i + 2] * b) * overbright - contrast; 	// b
		}
		ctx2.putImageData( imageData, 0, 0 );

		// slice canvas_copy to canvas_slice
		var numCols 	= Math.round(w / tileW),
			numLoops 	= Math.round((w * h) / (tileW * tileH)),
			x,
			y;
		// reset tiles
		tiles = [];

		ctx3.save();
		for (var i = 0; i < numLoops; i++) {
		// for ( var i = numLoops / 2; i < numLoops / 2 + 1; i++) {
		// for ( var i = 0; i <1; i++) {
			x = (i % numCols) * (tileW);
			y = Math.floor( i / numCols) * (tileH);

			ctx3.drawImage(c2, x, y, tileW, tileH, x, y, tileW, tileH);

			tiles.push({
				x: x,
				y: y
			});
		}
		ctx3.restore();
	}


	// events
	// canvas click
	$('canvas#canvas_slice').click(function(){
		console.log('click');
	}).mousemove(function(e) {
		var i,
			tile,
			tileGrow,
			sizeHalf,
			hypo,
			angle,
			velX,
			velY;

		var forceStep = maxForce / maxDist;
		ctx3.clearRect (0, 0, w, h);

		for ( i in tiles) {
			tile 		= tiles[i];
			hypo 		= distanceBetween( {x: tile.x, y: tile.y}, {x: e.offsetX, y: e.offsetY});
			var perc 	=  100 - (100 / maxDist) * hypo;
			tileGrow 	= (grow / 100) * perc;
			sizeHalf 	= (tileW * tileGrow) >> 1;

			var dx = tile.x - e.offsetX;
			var dy = tile.y - e.offsetY;
			angle = Math.asin(dx / hypo);

			// hypo = distanceBetween( {x: tile.x, y: tile.y}, {x: e.offsetX, y: e.offsetY});

			velX = Math.sin( angle ) * (maxForce - (forceStep * hypo));
			velY = Math.cos( angle ) * (maxForce - (forceStep * hypo));
			if (dy < 0) {
				velY = -velY;
			}

			tile.newX = tile.x + velX;
			tile.newY = tile.y + velY;

			ctx3.save();
			ctx3.drawImage(c2, tile.x, tile.y, tileW, tileH, tile.newX - sizeHalf, tile.newY - sizeHalf, tileW * tileGrow, tileH * tileGrow);
			ctx3.restore();

			$('#output').val(angle * RAD);
		}
	}).mouseout(function(){
		var i, tile;
		ctx3.clearRect (0, 0, w, h);
		for ( i in tiles) {
			tile = tiles[i];
			ctx3.save();
			ctx3.drawImage(c2, tile.x, tile.y, tileW, tileH, tile.x, tile.y, tileW, tileH);
			ctx3.restore();
		}
	});


	function distanceBetween( pos1, pos2 ) {
		var dist1 = pos1.x - pos2.x;
		var dist2 = pos1.y - pos2.y;
		return Math.sqrt( dist1 * dist1 + dist2 * dist2 );
	}

	// color control
	$('input[type="range"].color').change(function(){
		var id = $(this).attr('id');
		if ( id == 'red') {
			r = $(this).val();
		} else if (id == 'green') {
			g = $(this).val();
		} else {
			b = $(this).val();
		}
		updateImage();
	})
	.attr('min', '0')
	.attr('max', '1')
	.attr('step', '0.01')
	.attr('value', 100)
	.change();

	// overbright
	$('input[type="range"]#overbright').change(function(){
		overbright = $(this).val();
		updateImage();
	})
	.attr('min', '1')
	.attr('max', '4')
	.attr('step', '0.5')
	.attr('value', 1);

	// contrast
	$('input[type="range"]#contrast').change(function(){
		contrast = -$(this).val();
		updateImage();
	})
	.attr('min', '-200')
	.attr('max', '200')
	.attr('step', '5')
	.attr('value', 1);

	// force
	$('input[type="range"]#force').change(function(){
		maxForce = $(this).val();
	})
	.attr('min', '1')
	.attr('max', '100')
	.attr('step', '5')
	.attr('value', 1);

	// tile size
	$('input[type="range"]#tiles').change(function(){
		tileW = $(this).val();
		tileH = tileW;
		updateImage();
	})
	.attr('min', '5')
	.attr('max', '75')
	.attr('step', '1')
	.attr('value', 5)
	.change();

	// grow
	$('input[type="range"]#grow').change(function(){
		grow = $(this).val();
	})
	.attr('min', '1')
	.attr('max', '5')
	.attr('step', '1')
	.attr('value', 1);

})(jQuery);