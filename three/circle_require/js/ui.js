define([
	'jquery', 
	'underscore',
	'iscroll',
	// 'views/components/Controls',
	// 'views/components/Sound',

], function($, _, iscroll) {
	
	return {
		foo: null,
		trailScroll: null,

		// modules
		init: function() {
			this.trailScroll = new iScroll('scroll', {vScrollbar: false, vScroll: false});

			var me = this;
			window.addEventListener( 'resize', function(){
				me.onWindowResize();
			}, false );
			this.onWindowResize();
		},

		onWindowResize: function( e ) {
			// $('#background').css('height', $(document).height());
		},

		setBackground: function(img) {
			$('#artist_image').off().on('load', function(e) {
				 var image = event.target,
				 	$image = $(image),
				 	colors = getDominantColor(image);
				 	$('#container').css('background-color', 'rgba('+ colors.join(', ') +', 1)');
			}).attr('src', 'img.php?img=' + img);
		}
	}
});

