/**
 * Experiment met Web Audio
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 * http://webaudio-io2012.appspot.com/
 * http://www.html5-demos.appspot.com/static/webaudio/createMediaSourceElement.html
 * http://www.htmlfivewow.com

 * Loader gejat van:
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 *
 * impulse response files van:
 * http://www.voxengo.com/impulses/
 **/

var soundPath = '../lib/sound';
var soundFiles = [
   /*
	'savant_1.mp3',
	'savant_2.mp3',
	'savant_3.mp3',
	'omen.mp3',
	'ring_of_fire.mp3',

	'helicopter.mp3',
	  */
	  'omen.mp3',
];
var file = soundPath + '/'  + soundFiles[Math.floor(Math.random() * soundFiles.length-1) + 1];
var soundPlayer = new SoundPlayer('audio_container', file);



function onLoad(e) {
	soundPlayer.init();
	soundPlayer.play();
	initControls();
}
window.addEventListener('load', onLoad, false);

function convolverLoaded( convolverList ) {
	soundPlayer.setConvolver(convolverList[0]);
}

function initControls() {
	/* -------------------------------------------
	 * SLIDERS
	 * ------------------------------------------- */
	$( "#volume-slider" ).slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 1,
		step: 0.01,
		value: 1,
		slide: function( event, ui ) {soundPlayer.setVolume( ui.value ); }
	});

	$( "#pitch-slider" ).slider({
		orientation: "vertical",
		range: "min",
		min: 0.5,
		max: 2,
		step: 0.01,
		value: 1,
		slide: function( event, ui ) {soundPlayer.setPitch( ui.value ); }
	});

	 $( "#pan-slider" ).slider({
		orientation: "horizontal",
		range: "min",
		min: -10,
		max: 10,
		step: 0.5,
		value: 0,
		slide: function( event, ui ) {soundPlayer.setPan( ui.value, 0, 0 ); }
	});

	$( "#speed-slider" ).slider({
		orientation: "horizontal",
		range: "min",
		min: -5,
		max: 5,
		step: 0.5,
		value: 0,
		slide: function( event, ui ) {soundPlayer.setSpeed( ui.value ); }
	});

	/* -------------------------------------------
	 * KNOBS
	 * ------------------------------------------- */
	$("#highpass-knob").knob({ 'change' : function (v) {
		var val = v / 100;
		soundPlayer.setHighpass( val );
	}});

	$("#lowpass-knob").knob({ 'change' : function (v) {
		var val = v / 100;
		val = 1 - val;
		soundPlayer.setLowpass( val );
	}});

	$("#delay-knob").knob({ 'change' : function (v) {
		setDelay();
	}});
	$("#delay-volume-knob").knob({ 'change' : function (v) {
		setDelay();
	}});
	function setDelay() {
		var delay = $("#delay-knob").val() / 100;
		var delayVolume = $("#delay-volume-knob").val() / 100;
		soundPlayer.setDelay( delay, delayVolume );
	}

	$(".wahwah").knob({ 'change' : function (v) {
		setWahWah();
	}});
	function setWahWah() {
		var baseFreq    = $('#wahwah-freq-knob').val() / 100;
		var octaves     = $('#wahwah-octaves-knob').val();
		var sweep       = $('#wahwah-sweep-knob').val() / 100;
		var resonance   = $('#wahwah-sweep-knob').val() / 100;
		soundPlayer.setWahWah(baseFreq, octaves, sweep, resonance);
	}

	$(".phaser").knob({ 'change' : function (v) {
		setPhaser();
	}});

	function setPhaser() {
		var rate        = $('#phaser-rate-knob').val() / 100;
		var depth       = $('#phaser-depth-knob').val() / 100;
		var feedback    = $('#phaser-feedback-knob').val() / 100;
		var modulation  = $('#phaser-modulation-knob').val();
		soundPlayer.setPhaser(rate, depth, feedback, modulation);
	}

	$(".overdrive").knob({ 'change' : function (v) {
		setOverdrive();
	}});

	function setOverdrive() {
		var gain        = $('#overdrive-gain-knob').val() / 100;
		var drive       = $('#overdrive-drive-knob').val() / 100;
		var curve       = $('#overdrive-curve-knob').val() / 100;
		var algorithm   = $('#overdrive-algorithm-knob').val();
		soundPlayer.setOverdrive(gain, drive, curve, algorithm);
	}


	/*
	outputGain: 0.5,         //0 to 1+
	drive: 0.7,              //0 to 1
	curveAmount: 1,          //0 to 1
	algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
	*/

	 /* -------------------------------------------
	 * BUTTONS
	 * ------------------------------------------- */
	$('#toggle-wahwah').change(function(){
		soundPlayer.connectWahWah($(this).is(':checked'));
	});
	$('#toggle-phaser').change(function(){
		soundPlayer.connectPhaser($(this).is(':checked'));
	});
	$('#toggle-overdrive').change(function(){
		soundPlayer.connectOverdrive($(this).is(':checked'));
	});

	$('#toggle_play').click(function() {
		pause = soundPlayer.pause();
		if (! pause) {
			$(this).val('play');
		} else {
			$(this).val('pause');
		}
	});


	$('input[name=convolver]').change(function(){
		if ($(this).val() !== '') {
			soundPlayer.loadConvolver([soundPath + '/reverbs/' + $(this).val()], convolverLoaded);
		} else {
			soundPlayer.removeConvolver();
		}
	});

	$('#volume').change();
	$('#lowpass').change();
	$('#highpass').change();
	$('#pan').change();
	$('#delay').change();
}
