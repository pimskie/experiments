define([
	'jquery', 
	'underscore',
	'backbone',
	'views/Master',
	'views/components/Controls',
	'views/components/Sound',

], function($, _, Backbone, Master, Controls, Sound) {
	
	return {
		soundCtx: null,
		soundSource: null,
		audioElement: null,

		// modules
		master: null,
		delay: null,
		audioObject: {},

		init: function() {
			console.log( 'app init' );
		},

		initAudio: function() {
			var soundCtx;
			if (typeof AudioContext !== "undefined") {
		        this.soundCtx = new AudioContext();
		    } else if (typeof webkitAudioContext !== "undefined") {
		        this.soundCtx = new webkitAudioContext();
		    } else {
		        throw new Error('Audio Context not supported.');
		    }

			window.audio 		= new Audio();
			audio.seekable 		= true;
			audio.loop 			= true;
			audio.controls 		= false;
			audio.src 			= 'sound/ring_of_fire.mp3';
			this.audioElement	= audio;
			document.querySelector('#audio_container').appendChild(audio);
		},

		createSource: function() {
			this.soundSource = this.soundCtx.createMediaElementSource( this.audioElement );
		},

		run: function() {
			this.defaultOptions = {
				soundSource: 	this.soundSource,
				soundCtx: 		this.soundCtx,
				audioElement: 	this.audioElement,
			};

			var controls = new Controls( this.defaultOptions );
			controls.render( );

			var options = _.clone( this.defaultOptions );
			options.className = 'component master';

			var master = new Master( options );
			var el = master.render().el;
			$('#container').append(el);	
			
			options = _.clone( this.defaultOptions );
			options.className = 'component sound';
        	var sound = new Sound( options );
        	$('#container').append(sound.render().el);
		},
	};
});

