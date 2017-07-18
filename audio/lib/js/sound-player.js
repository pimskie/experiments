/*
 * ---------------------------------------------------------------------------
 * 0.0001: added audio element for streamin support
 * ---------------------------------------------------------------------------
  **/


/**
 * string	audioContainer	id of DOM element where audio object will be placed
 **/
function SoundPlayer (audioContainer, soundUrl) {
    this.audioElement 		= null;
    this.source 			= null;
    this.ctx 				= null;
    this.bufferLoader 		= null;
    this.playing 			= true;
    this.canvasCtx			= document.getElementById('frequency').getContext('2d');
    this.tuna				= null;

    if (typeof AudioContext !== "undefined") {
        this.ctx = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        this.ctx = new webkitAudioContext();
    } else {
        throw new Error('Audio Context not supported.');
    }

    this.tuna = new Tuna(this.ctx);

    // create audio element
	window.audio = new Audio();
	audio.seekable = true;
	audio.loop = true;
	audio.controls = false;
	audio.src = soundUrl;
	this.audioElement = audio;
	document.querySelector('#' + audioContainer).appendChild(audio);

    // setup filters
    this.wahWahConnected = false;
    this.phaserConnected = false;
    this.overdriveConnected = false;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.6;
    this.analyser.fftSize = 1024;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.highpassFilter = this.ctx.createBiquadFilter( );
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = 90;
    this.highpassFilter.Q.value = 0;

    this.lowpassFilter = this.ctx.createBiquadFilter( );
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 40000;
    this.lowpassFilter.Q.value = 0;

    this.notchFilter = this.ctx.createBiquadFilter( );
    this.notchFilter.type = 'notch';

    this.volume 	= this.ctx.createGain();
    this.panner 	= this.ctx.createPanner();
    this.convolver	= this.ctx.createConvolver();

    this.delay 			= this.ctx.createDelay();
    this.delayVolume 	= this.ctx.createGain();
	this.delay.delayTime.value = 0;
	this.delayVolume.gain.value = 1;

	this.wahWah 	= new this.tuna.WahWah({
		 automode: true,                //true/false
	     baseFrequency: 0.5,            //0 to 1
	     excursionOctaves: 2,           //1 to 6
	     sweep: 0.2,                    //0 to 1
	     resonance: 10,                 //1 to 100
	     sensitivity: 0.5,              //-1 to 1
	     bypass: 0
	});

	this.phaser = new this.tuna.Phaser({
	     rate: 0.01,                     //0.01 to 8 is a decent range, but higher values are possible
	     depth: 0.3,                    //0 to 1
	     feedback: 0,                 //0 to 1+
	     stereoPhase: 0,               //0 to 180
	     baseModulationFrequency: 700,  //500 to 1500
	     bypass: 0
	 });

	this.overdrive = new this.tuna.Overdrive({
        outputGain: 0.5,         //0 to 1+
        drive: 0.7,              //0 to 1
        curveAmount: 1,          //0 to 1
        algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
        bypass: 0
    });
}

SoundPlayer.prototype.init = function(soundUrl) {
	this.source = this.ctx.createMediaElementSource(this.audioElement);
	this.wire();
}

SoundPlayer.prototype.wire = function() {

	var connectFrom = this.volume,
		connectTo 	= this.lowpassFilter;

	this.wahWah.disconnect();
	this.phaser.disconnect();
	this.overdrive.disconnect();

	this.source.connect( this.volume );
	this.source.connect( this.delay );
	this.delay.connect( this.delayVolume );
	this.delayVolume.connect( this.volume );

	if ( this.wahWahConnected) {
		connectFrom.connect(this.wahWah.input);
		connectFrom = this.wahWah;
		connectTo = this.lowpassFilter;
	}

	if ( this.phaserConnected) {
		connectFrom.connect(this.phaser.input);
		connectFrom = this.phaser;
		connectTo = this.lowpassFilter;
	}

	if ( this.overdriveConnected) {
		connectFrom.connect(this.overdrive.input);
		connectFrom = this.overdrive;
		connectTo = this.lowpassFilter;
	}
	connectFrom.connect( connectTo );
	connectTo.connect( this.highpassFilter );

	// this.lowpassFilter.connect( this.highpassFilter );
	this.highpassFilter.connect( this.panner );
	this.panner.connect( this.compressor );
	this.compressor.connect( this.analyser );
	this.analyser.connect( this.ctx.destination );

}


SoundPlayer.prototype.loop = function(time) {
	// viiiiees, Patrick (andere verwijzing naar SoundPlayer vinden);
	soundPlayer.updateVisuals();
	requestAnimFrame(soundPlayer.loop);
}

SoundPlayer.prototype.updateVisuals = function() {
	// ------------- bars
	var freqByteData = new Uint8Array(soundPlayer.analyser.frequencyBinCount);
  	soundPlayer.analyser.getByteFrequencyData(freqByteData);

	// ripped: http://www.html5-demos.appspot.com/static/webaudio/createMediaSourceElement.html
	var ctxFreq = document.getElementById('frequency').getContext('2d');
  	var avg = soundPlayer.getAverageVolume(freqByteData);

	ctxFreq.clearRect(0, 0, 400, 400);
	ctxFreq.fillStyle = '#222';
	var space 	= 3;
	var width 	= 3;
	var numBars = 200;
	var freq = Math.floor( freqByteData.length / numBars );

	for ( var i = 0; i < numBars; i++ ){
        var value = freqByteData[i * freq];
		ctxFreq.fillRect(i * space + width, 300-value-avg, width, 300);
    }

    // ------------- wave
    var ctxWave = document.getElementById('wave').getContext('2d');
    var freqByteData2 = new Uint8Array(soundPlayer.analyser.frequencyBinCount);
  	soundPlayer.analyser.getByteTimeDomainData(freqByteData2);

  	var minMax = soundPlayer.getMinMax(freqByteData2);
  	var min = minMax[0];
  	var max = minMax[1] + 1;
  	var perc = (100 / max) * freqByteData[freqByteData.length / 4];
  	perc = parseInt(perc) * 1.5;

  	// http://www.htmlfivewow.com/demos/audio-visualizer/index.html
  	document.getElementById('wave-container').style.backgroundSize = perc + '%, ' + perc + '%';

  	ctxWave.clearRect(0, 0, 400, 400);
    for ( var i = 0; i < (freqByteData2.length ); i++ ){
        var value = freqByteData2[i];
        ctxWave.fillRect(i, (value/3) + 50, 1, 1);
    }

    // ------ UV
    var rotatePerc = ((100 / max) * avg) ;
    var maxRotate = 120;
    var rotate = Math.min((120 / 100) * rotatePerc, 100);
    rotate = rotate - 45;

    document.getElementById('pin').style.webkitTransform = 'rotate(' + rotate + 'deg)';
}

SoundPlayer.prototype.getAverageVolume = function(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }

    average = values / length;
    return average;
}

SoundPlayer.prototype.getMinMax = function(array) {
  var max = array[0];
  var min = array[0];
  var len = array.length;
  for (var i = 0; i < len; ++i) {
    if (array[i] > max) {
      max = array[i];
    }
    if (array[i] < min) {
      min = array[i];
    }
  }
  var arr = [min, max];
  return arr;
}


SoundPlayer.prototype.play = function() {
	this.audioElement.play();
	this.loop();

}

SoundPlayer.prototype.pause = function() {
	if ( this.playing == true) {
		this.playing = false;
		this.audioElement.pause();
	} else {
		this.playing = true;
		this.audioElement.play();
	}
	return this.playing;
}

SoundPlayer.prototype.setVolume = function( val ) {
	this.volume.gain.value = val;
	return this.volume.gain.value;
}

SoundPlayer.prototype.setPan = function( x, y, z ) {
	this.panner.setPosition(x, y, z);
}

SoundPlayer.prototype.setPitch = function( val ) {
	this.audioElement.playbackRate = val;
	return val;
}

SoundPlayer.prototype.setDelay = function( delay, volume ) {
	this.delay.delayTime.value = delay;
	this.delayVolume.gain.value = volume;
	return delay;
}

SoundPlayer.prototype.setSpeed = function( val ) {
	//
	return val;
}

SoundPlayer.prototype.setLowpass = function( val ) {
	// hier snap ik niks van (http://www.html5rocks.com/en/tutorials/webaudio/intro/)
	var minValue = 40;
	var maxValue = this.ctx.sampleRate;
	var numberOfOctaves = Math.log(maxValue/minValue)/Math.LN2;
	var multiplier = Math.pow(2,numberOfOctaves*(val-1.0));
	this.lowpassFilter.frequency.value = maxValue * multiplier;

	return this.lowpassFilter.frequency.value;
}


SoundPlayer.prototype.setHighpass = function( val ) {
	// hier snap ik niks van (http://www.html5rocks.com/en/tutorials/webaudio/intro/)
	var minValue = 40;
	var maxValue = this.ctx.sampleRate;
	var numberOfOctaves = Math.log(maxValue/minValue)/Math.LN2;
	var multiplier = Math.pow(2,numberOfOctaves*(val-1.0));
	this.highpassFilter.frequency.value = maxValue * multiplier;
	return this.highpassFilter.frequency.value;
}

SoundPlayer.prototype.loadConvolver = function(sounds, callback) {
	this.bufferLoader = new BufferLoader(this.ctx, sounds, callback);
	this.bufferLoader.load();
}

SoundPlayer.prototype.setConvolver = function( buffer ) {
	this.convolver.buffer = buffer;
	this.analyser.connect( this.convolver );
	this.convolver.connect( this.ctx.destination );
}

SoundPlayer.prototype.removeConvolver = function() {
	this.convolver.disconnect( this.ctx.destination );
	this.analyser.connect( this.ctx.destination );
}

SoundPlayer.prototype.setWahWah = function(baseFreq, octaves, sweep, resonance) {
	this.wahWah.baseFrequency = baseFreq;
	this.wahWah.excursionOctaves = octaves;
	this.wahWah.sweep = sweep;
	this.wahWah.resonance = resonance;
}
SoundPlayer.prototype.connectWahWah = function(connect) {
	this.wahWahConnected = connect;
	this.wire();
}

SoundPlayer.prototype.setPhaser = function(rate, depth, feedback, modulation) {
	this.phaser.rate = rate;
	this.phaser.depth = depth;
	this.phaser.feedback = feedback;
	this.phaser.baseModulationFrequency = modulation;
}
SoundPlayer.prototype.connectPhaser = function(connect) {
	this.phaserConnected = connect;
	this.wire();
}

SoundPlayer.prototype.setOverdrive = function(outputGain, drive, curveAmount, algorithmIndex) {
	this.overdrive.outputGain = outputGain;
	this.overdrive.drive = drive * 2;
	this.overdrive.curveAmount = curveAmount;
	this.overdrive.algorithmIndex = algorithmIndex;
}

SoundPlayer.prototype.connectOverdrive = function(connect) {
	this.overdriveConnected = connect;
	this.wire();
}

SoundPlayer.prototype.setNotch = function( val ) {
	var minValue = 40;
	var maxValue = this.ctx.sampleRate;
	var numberOfOctaves = Math.log(maxValue/minValue)/Math.LN2;
	var multiplier = Math.pow(2,numberOfOctaves*(val-1.0));
	this.notchFilter.frequency.value = maxValue * multiplier;
	return this.notchFilter.frequency.value;
}

