(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
// [motorMax, scratchMultiply] - duration sec
// [3, 30] - 100

var times = {
	motorOn: 0.05,
	motorOff: -0.05,

	// changing motor speed changes scratch effect.
	// Change scratchMultiply too
	motorMax: 3,
	scratchMultiply: 30,

	powerOff: -0.005,
	scratchRamp: 0.1,
	sampleTime: 2
};

exports.default = times;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * TODO:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Nice test MP3: https://s3-us-west-2.amazonaws.com/s.cdpn.io/481938/Find_My_Way_Home.mp3
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * When scratching, the speed varies very much
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Take average of speed
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Note: didn't work out nice, see #214
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * When a new sample is created, a 'plop' can occure
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Maybe create a new source one second before end and fade it in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Drag - throw - velocity
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * BUGS
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://bugzilla.mozilla.org/show_bug.cgi?id=1069825
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * http://stackoverflow.com/questions/37027694/audio-api-setvaluecurveattime-firefox/37030293#37030293
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Problems in FF:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * - after playbackRate reaches 0, it resets to 1
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * - only the first set value of an AudioParam is returned:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *      - https://bugzilla.mozilla.org/show_bug.cgi?id=893020
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *      - https://bugzilla.mozilla.org/show_bug.cgi?id=1171438
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *      - https://github.com/WebAudio/web-audio-api/issues/318
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *      - gainNode.gain.value = 0.5;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *      - gainNode.gain.value = 1;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *      - console.log(gainNode.gain.value) -> 0.5
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

// imports


var _times = require('./configs/times');

var _times2 = _interopRequireDefault(_times);

var _SampleCreator = require('./utils/SampleCreator');

var _SampleCreator2 = _interopRequireDefault(_SampleCreator);

var _fpsmeter = require('./utils/fpsmeter');

var _fpsmeter2 = _interopRequireDefault(_fpsmeter);

var _bufferLoader = require('./utils/bufferLoader');

var _bufferLoader2 = _interopRequireDefault(_bufferLoader);

var _slider = require('./ui/slider');

var _slider2 = _interopRequireDefault(_slider);

var _deck = require('./deck');

var _deck2 = _interopRequireDefault(_deck);

var _drawer = require('./drawer');

var _drawer2 = _interopRequireDefault(_drawer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// some constants
var SC_CLIENT_ID = '2c6869e4a458d26865a2a11040c5a623';

// default state of track
var TRACK_STATE = {
	started: false,
	reversed: false,
	scratching: false,

	source: null,
	duration: 0, // total duration of source in MS
	position: 0, // current playback position of source in MS
	progress: 0, // playback progress of source in % (0 - 100)
	volume: 1
};

// initialize soundCloud
SC.initialize({ client_id: SC_CLIENT_ID }); // eslint-disable-line camelcase

var Controller = function () {
	function Controller(selector) {
		_classCallCheck(this, Controller);

		// references DOM elements
		this.el = document.querySelector(selector);

		this.dom = this.getDomElements();

		// audioContext and volume controller
		this.audioCtx = new AudioContext();
		this.gainNode = this.audioCtx.createGain();
		this.convolver = this.audioCtx.createConvolver();

		// buffer loader to load and decode audio files
		this.bufferLoader = new _bufferLoader2.default(this.audioCtx);

		// complete buffer of the track
		// gets assigned after track is loaded
		this.globalSourceBuffer = null;

		// used in timer
		this.timerTimestamp = Date.now();

		// state of the playing track
		this.track = this.defaultTrackState;

		this.motorRunning = false;

		this.lastFps = 0;

		// bind the methods to `this` scope
		this.setScopes();

		// components
		this.deck = new _deck2.default({
			selector: '.js-turntable',
			touchStartHandler: this.onDeckTouch.bind(this),
			touchEndHandler: this.onDeckRelease.bind(this),
			touchMoveHandler: this.onDeckMove.bind(this)
		});

		this.drawer = new _drawer2.default({
			selector: '.js-drawer',
			seekStartHandler: this.onSeekHandler.bind(this)
		});

		// created everytime a track is loaded
		this.sampleCreator = null;

		this.loadSoundCloudTrack(this.dom.selectTrack.value);
		// this.loadUrl('https://s3-us-west-2.amazonaws.com/s.cdpn.io/481938/Find_My_Way_Home.mp3');
	}

	_createClass(Controller, [{
		key: 'onClickLoadTrack',
		value: function onClickLoadTrack() {
			var url = this.dom.inputTrack.value;

			// reset dropdown
			this.dom.selectTrack.value = '';

			this.loadTrack(url);
		}
	}, {
		key: 'onSelectTrack',
		value: function onSelectTrack(e) {
			this.loadTrack(e.target.value);
		}

		/**
   * Adjust tempo of the motor
   *
   * @param {CustomEvent} with the properties `percent` and `value`
   */

	}, {
		key: 'onSetTempo',
		value: function onSetTempo(e) {
			var detail = e.detail;
			var tempoValue = detail.value;

			this.deck.setTempo(tempoValue);
		}
	}, {
		key: 'onReverbChange',
		value: function onReverbChange(e) {
			var target = e.target;
			var reverbName = target.value;

			if (reverbName === '') {
				this.disconnectConvolver();
			} else {
				var url = 'dist/sounds/reverbs/' + reverbName + '.wav';

				// url, this.onReverbLoaded, this
				this.bufferLoader.load({
					url: url,
					succesCallback: this.onReverbLoaded,
					scope: this
				});
			}
		}
	}, {
		key: 'onReverbLoaded',
		value: function onReverbLoaded(decodedBuffer) {
			console.log('reverb loaded');

			this.convolver.buffer = decodedBuffer;

			// hacky hacky quick and dirty
			this.connectConvolver();
		}
	}, {
		key: 'connectConvolver',
		value: function connectConvolver() {
			try {
				this.disconnectConvolver();
			} catch (e) {}

			this.gainNode.disconnect(this.audioCtx.destination);
			this.gainNode.connect(this.convolver);
			this.convolver.connect(this.audioCtx.destination);
		}
	}, {
		key: 'disconnectConvolver',
		value: function disconnectConvolver() {
			this.convolver.disconnect(this.audioCtx.destination);
			this.gainNode.disconnect(this.convolver);
			this.gainNode.connect(this.audioCtx.destination);
		}
	}, {
		key: 'loadTrack',
		value: function loadTrack(url) {
			if (!url) {
				return;
			}

			this.stop();
			this.reset();

			if (url.indexOf('soundcloud') === -1) {
				this.loadUrl(url);
			} else {
				this.loadSoundCloudTrack(url);
			}
		}

		/**
   * Loads soundcloud data by a soundcloud track URL
   * @param {string} soundCloudUrl the soundCloud track URL
   * @see {@link https://developers.soundcloud.com/docs/api/sdks}
   */

	}, {
		key: 'loadSoundCloudTrack',
		value: function loadSoundCloudTrack(soundCloudUrl) {
			var _this = this;

			console.log('resolving SC... ' + soundCloudUrl);

			SC.resolve(soundCloudUrl).then(function (response) {
				var streamUrl = response.stream_url + '?client_id=' + SC_CLIENT_ID;
				var imageUrl = response.artwork_url ? response.artwork_url.replace('large', 'crop') : '';

				_this.deck.setImage(imageUrl);

				_this.loadUrl(streamUrl);
			}, function (err) {
				console.log('error', err);
			});
		}

		/**
   * Create a XMLHttpRequest to load a URL as arraybuffer
   *
   * @param {string} url The URL of the track to load
   * @see {@link https://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/js/AudioHandler.js}
   */

	}, {
		key: 'loadUrl',
		value: function loadUrl(url) {
			console.log('loading buffer...');

			this.bufferLoader.load({
				url: url,
				succesCallback: this.onAudioDecoded,
				progressCallback: this.onTrackLoading,
				scope: this
			});
		}
	}, {
		key: 'onAudioDecoded',
		value: function onAudioDecoded(decodedBuffer) {
			console.log('decoding done!');

			this.globalSourceBuffer = decodedBuffer;

			this.initSample(decodedBuffer);

			this.initialize();
		}
	}, {
		key: 'onTrackLoading',
		value: function onTrackLoading(progress) {
			// console.log(progress);
		}
	}, {
		key: 'initialize',
		value: function initialize() {
			// update track properties with new buffer duration
			this.track.duration = this.globalSourceBuffer.duration;

			// reset the volume to the correct state
			this.gainNode.gain.value = this.track.volume;

			// update components with new data
			this.deck.setDuration(this.globalSourceBuffer.duration);
			this.drawer.draw(this.globalSourceBuffer);

			// connect the volume to the destination (source is connected to volume)
			this.gainNode.connect(this.audioCtx.destination);

			this.toggleUI(true);
		}
	}, {
		key: 'initSample',
		value: function initSample(buffer) {
			// create a samplecreator which can slice a audio buffer into small parts
			this.sampleCreator = new _SampleCreator2.default(this.audioCtx, buffer);
		}

		/**
   * Cancel all sceduled value changes on the playbackRate
   */

	}, {
		key: 'cancelScheduledPlaybackRate',
		value: function cancelScheduledPlaybackRate() {
			this.track.source.playbackRate.cancelScheduledValues(this.audioCtx.currentTime);
		}
	}, {
		key: 'onSetVolume',
		value: function onSetVolume(e) {
			var volume = e.target.value;

			this.gainNode.gain.value = volume;
		}

		/**
   * Callback function for `Deck.touchStartHandler`
   */

	}, {
		key: 'onDeckTouch',
		value: function onDeckTouch() {
			this.track.scratching = true;

			this.pause();
		}

		/**
   * Callback function for `Deck.touchEndHandler`
   */

	}, {
		key: 'onDeckRelease',
		value: function onDeckRelease(progress) {
			this.track.position = this.track.duration / 100 * progress;
			this.track.scratching = false;

			this.setPlaybackRate(1);
			this.play();
		}

		/**
   * Callback function for `Deck.touchMoveHandler`
   * @param {float} speed the speed which the deck was rotated
   * @param {float} progress progress of the deck in percent
   * @return {void}
   */

	}, {
		key: 'onDeckMove',
		value: function onDeckMove(speed, progress) {
			var scratchMultiply = _times2.default.scratchMultiply;

			this.track.position = this.track.duration * 0.01 * progress;

			speed *= scratchMultiply;
			speed = speed.toFixed(2);

			this.setPlaybackRate(speed, true, true, 0.05);
		}

		/**
   * Callback function for `Drawer.seekStartHandler`
   * @param {number} the progress which was clicked in the drawer
   * @return {void}
   */

	}, {
		key: 'onSeekHandler',
		value: function onSeekHandler(progress) {
			this.track.position = this.track.duration * 0.01 * progress;

			this.play();
		}

		/**
   * Set the playbackRate of playing source. Can be negative, zero or positive
   * If negative, track is reversed, if zero, track is stopping
   *
   * @param {number} speed the playback speed, defaults 1
   * @param {boolean} rampDown ramp the speed to 0 after reaching `speed`, defaults false
   * @param {boolean} rampUp ramp up the current speed to `speed`, defaults false
   * @param {number} time time to complete the speed ramp in sec, defaults timeConfigs.scratchRamp
   */

	}, {
		key: 'setPlaybackRate',
		value: function setPlaybackRate() {
			var speed = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
			var rampDown = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
			var rampUp = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
			var time = arguments.length <= 3 || arguments[3] === undefined ? _times2.default.scratchRamp : arguments[3];

			// Note: firefox can't handle `0` value for playbackRate
			// after 0 is reached, it's resetted back to 1
			if (!this.track.source) {
				return;
			}

			var currentPlaybackRate = this.track.source.playbackRate.value;
			var absolutePlaybackRate = Math.abs(speed);

			// round on 2 decimals
			absolutePlaybackRate = Math.round(absolutePlaybackRate * 100) / 100;

			var speedMinus = speed < 0;
			var shouldReverse = this.track.reversed !== speedMinus;

			if (shouldReverse) {
				this.track.reversed = !this.track.reversed;
				this.play();
			}

			this.cancelScheduledPlaybackRate();

			// to bad `setValueCurveAtTime` is bugged in FF
			if (rampUp) {
				this.track.source.playbackRate.setValueAtTime(currentPlaybackRate, this.audioCtx.currentTime);
				this.track.source.playbackRate.linearRampToValueAtTime(absolutePlaybackRate, this.audioCtx.currentTime + time);

				time *= 1.5;
			} else {
				this.track.source.playbackRate.setValueAtTime(absolutePlaybackRate, this.audioCtx.currentTime);
			}

			if (rampDown) {
				this.track.source.playbackRate.linearRampToValueAtTime(0, this.audioCtx.currentTime + time);
			}
		}
	}, {
		key: 'setupSample',
		value: function setupSample() {
			var sampleTime = arguments.length <= 0 || arguments[0] === undefined ? _times2.default.sampleTime : arguments[0];

			// startTime in MS
			var startTime = this.track.position;

			if (this.track.reversed) {
				startTime = this.track.duration - startTime;
			}

			// create a new sample
			this.track.source = this.sampleCreator.create(this.track.position, this.track.reversed, sampleTime);

			// connect it to the volume
			this.track.source.connect(this.gainNode);
		}

		/**
   * Pause playback of the track by setting playback rate to 0
   */

	}, {
		key: 'pause',
		value: function pause() {
			this.setPlaybackRate(0, true);
		}

		/**
   * Reset the state of the track and reset deck
   */

	}, {
		key: 'reset',
		value: function reset() {
			cancelAnimationFrame(this.raf);
			this.motorRunning = false;

			this.deck.toggleMotor(this.motorRunning);
			this.deck.reset();
			this.drawer.reset();

			this.toggleUI(false);

			this.track = Object.assign({}, this.defaultTrackState);
		}
	}, {
		key: 'togglePower',
		value: function togglePower() {
			this.motorRunning = false;

			this.deck.toggleMotor(this.motorRunning, true);
		}
	}, {
		key: 'toggleMotor',
		value: function toggleMotor() {
			this.motorRunning = !this.motorRunning;

			this.deck.toggleMotor(this.motorRunning);

			cancelAnimationFrame(this.raf);

			this.play();
		}
	}, {
		key: 'stop',
		value: function stop() {
			if (this.track.source) {
				this.cancelScheduledPlaybackRate();
				this.track.source.stop(0);
			}

			this.track.started = false;
			this.track.position = 0;

			cancelAnimationFrame(this.raf);
		}
	}, {
		key: 'play',
		value: function play() {
			cancelAnimationFrame(this.raf);

			this.track.started = true;

			// stop currently playing track
			if (this.track.source) {
				this.track.source.stop(0);
			}

			this.setupSample(_times2.default.sampleTime);

			// this.track.source.playbackRate.value = this.trackSpeed;

			this.timerTimestamp = performance.now();
			this.track.source.start(0, 0);

			this.updateLoop = this.updateLoop.bind(this);
			this.updateLoop();
		}
	}, {
		key: 'mute',
		value: function mute() {
			var silent = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

			var volume = silent ? 0 : 1;

			this.gainNode.gain.value = volume;
		}

		/**
   * Updates the current position and progress of the track
   */

	}, {
		key: 'updateLoop',
		value: function updateLoop() {
			this.lastFps = _fpsmeter2.default.fps;

			if (this.track.started) {
				var now = performance.now();
				var diff = now - this.timerTimestamp;
				var speed = this.trackSpeed;

				var resampleForward = void 0;
				var resampleBackward = void 0;

				// take speed in account of playback position
				diff *= speed;

				// diff from MS to S
				diff *= 0.001;

				this.track.position += diff;
				this.track.progress = this.track.position / this.track.duration * 100;

				// TODO: cleanup this mess
				if (this.track.position >= this.track.duration || this.track.reversed && this.track.position <= 0) {
					stop();
				} else {
					resampleForward = this.track.position >= this.sampleCreator.duration + this.sampleCreator.offset;
					resampleBackward = this.track.reversed && this.track.position <= this.sampleCreator.offset - this.sampleCreator.duration;

					if (resampleForward || resampleBackward) {
						this.play();
					}

					this.drawer.update(this.track.progress);

					if (!this.track.scratching) {
						this.deck.setProgress(this.track.progress);
						// this.track.source.playbackRate.value = this.trackSpeed;
						this.track.source.playbackRate.setValueAtTime(this.trackSpeed, this.audioCtx.currentTime);
					}

					this.updateOutput();

					this.timerTimestamp = now;
				}
			}

			this.raf = requestAnimationFrame(this.updateLoop);
		}
	}, {
		key: 'setScopes',
		value: function setScopes() {
			var boundMethods = ['togglePower', 'toggleMotor', 'onClickLoadTrack', 'onSelectTrack', 'onSetVolume', 'onSetTempo', 'onReverbChange'];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = boundMethods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var method = _step.value;

					this[method] = this[method].bind(this);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		/**
   * Adds or removes eventListeners from the DOM UI elements
   *
   * @param {bool} enable if true, enables the ui, else disable them
   */

	}, {
		key: 'toggleUI',
		value: function toggleUI() {
			var enable = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

			var func = enable ? 'addEventListener' : 'removeEventListener';

			this.dom.toggleMotor[func]('click', this.toggleMotor);
			this.dom.togglePower[func]('click', this.togglePower);
			this.dom.selectTrack[func]('change', this.onSelectTrack);
			this.dom.loadTrack[func]('click', this.onClickLoadTrack);
			this.dom.volume[func]('input', this.onSetVolume);
			this.dom.sliderTempo[func]('change', this.onSetTempo);
			// for...of, not in chrome
			for (var i = 0; i < this.dom.radiosReverb.length; i++) {
				var radio = this.dom.radiosReverb[i];

				radio[func]('change', this.onReverbChange);
			}
		}

		/**
   * Get references to DOM elements
   * TODO: all selectors on name
   *
   * @param {none}
   * @return {object} Object with name-DOMElement pairs
   */

	}, {
		key: 'getDomElements',
		value: function getDomElements() {
			return {
				toggleMotor: this.getEl('.js-toggle-motor'),
				togglePower: this.getEl('.js-toggle-power'),
				selectTrack: this.getEl('.js-track-select'),
				inputTrack: this.getEl('.js-track-input'),
				loadTrack: this.getEl('.js-load-track'),
				sliderTempo: new _slider2.default('.js-slider-tempo', { min: 8, max: -8 }),
				volume: this.getEl('.js-volume'),
				output: this.getEl('.js-output'),
				radiosReverb: this.getEl('input[name="reverb"]', true)
			};
		}
	}, {
		key: 'getEl',
		value: function getEl(selector) {
			var multiple = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			if (multiple) {
				return this.el.querySelectorAll(selector);
			}

			return this.el.querySelector(selector);
		}
	}, {
		key: 'updateOutput',
		value: function updateOutput() {
			var speed = this.trackSpeed;

			this.dom.output.innerHTML = '\n\t\t\t\tfps: ' + this.lastFps + ' <br />\n\t\t\t\tspeed: ' + speed + 'x <br />\n\t\t\t\tprogress: ' + this.track.position + 's <br />\n\t\t\t\t' + this.track.duration + 's <br />\n\t\t\t\t' + Math.round(this.track.progress) + '%';
		}

		/**
   * Returns current track speed
   * Depends on user is scratching
   */

	}, {
		key: 'setIsActive',


		/**
   * Used in a `visibilitychange` event handler
   * If not visible, `isActive` is false and player pauses
   *
   * @param {bool} isActive state of the controller
   * @return {void}
   */
		value: function setIsActive(isActive) {
			// nothing to manage
			if (!this.track.started || !this.motorRunning) {
				return;
			}

			if (isActive && this.motorRunning) {
				this.play();
			} else {
				this.track.source.playbackRate.value = 0;
			}
		}
	}, {
		key: 'trackSpeed',
		get: function get() {
			var speed = void 0;

			if (this.track.scratching) {
				speed = this.track.source.playbackRate.value;
			} else {
				speed = this.deck.motorSpeedFactor;
			}

			if (this.track.reversed) {
				speed *= -1;
			}

			return speed;
		}
	}, {
		key: 'defaultTrackState',
		get: function get() {
			return Object.assign({}, TRACK_STATE);
		}
	}]);

	return Controller;
}();

exports.default = Controller;

},{"./configs/times":1,"./deck":3,"./drawer":4,"./ui/slider":6,"./utils/SampleCreator":7,"./utils/bufferLoader":8,"./utils/fpsmeter":9}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _times = require('./configs/times');

var _times2 = _interopRequireDefault(_times);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PI = Math.PI;
var TO_DEGREE = 180 / PI;
var TO_RADIAN = PI / 180;

// bring in the magic numbers
var ARM_MAX_ROTATION = 46;
var ARM_MIN_ROTATION = 24;
var ARM_ROTATION = ARM_MAX_ROTATION - ARM_MIN_ROTATION;

var Deck = function () {
	// eslint-disable-line no-unused-vars

	function Deck() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? { selector: '.js-turntable', duration: 30 } : arguments[0];

		_classCallCheck(this, Deck);

		Object.assign(this, options);

		this.el = document.querySelector(options.selector);

		this.disc = this.el.querySelector('.js-disc');
		this.arm = this.el.querySelector('.js-arm');
		this.motor = this.el.querySelector('.js-motor');

		this.elRect = this.disc.getBoundingClientRect();

		this.init();
	}

	_createClass(Deck, [{
		key: 'init',
		value: function init() {
			this.mouseDown = false;

			this.touchStartHandler = this.touchStartHandler || this.noop;
			this.touchEndHandler = this.touchEndHandler || this.noop;
			this.touchMoveHandler = this.touchMoveHandler || this.noop;

			this.radiansDiffHistory = [];
			this.maxHistory = 30;

			this.discRotation = 0;

			this.motorRunning = false;
			this.motorRotation = 0;
			this.motorMaxSpeed = _times2.default.motorMax; // can be alted by setting tempo
			this.motorSpeed = 0;
			this.motorSlope = 0;

			this.raf = null;

			this.radiansDefault = {
				current: 0, // current rotation (-PI - PI)
				previous: 0, // previous rotation (-PI - PI)
				rotated: 0, // total rotation (0 - *)
				rotatedPrevious: 0, // previous total rotation (0 - *)
				rotatedDiff: 0, // difference in rotation
				total: 0,
				touchStart: 0 // angle of pointer
			};

			this.radians = Object.assign({}, this.radiansDefault);

			this.midX = this.elRect.width >> 1;
			this.midY = this.elRect.height >> 1;

			this.addEventHandlers();
		}
	}, {
		key: 'noop',
		value: function noop() {
			// placeholder
		}
	}, {
		key: 'addEventHandlers',
		value: function addEventHandlers() {
			var _this = this;

			this.mouseDownHandler = function (e) {
				_this.onMouseDown(e);
			};

			this.mouseUpHandler = function (e) {
				_this.onMouseUp(e);
			};

			this.mouseMoveHandler = function (e) {
				_this.onMouseMove(e);
			};

			this.disc.addEventListener('mousedown', this.mouseDownHandler);
		}
	}, {
		key: 'onMouseDown',
		value: function onMouseDown(e) {
			var mousePosition = this.getDiscMousePosition(e);

			this.mouseDown = true;

			this.radians.mouse = Math.atan2(mousePosition.y - this.midY, mousePosition.x - this.midX);

			document.body.addEventListener('mousemove', this.mouseMoveHandler);
			document.body.addEventListener('mouseup', this.mouseUpHandler);

			document.body.classList.add('is-scratching');

			this.touchStartHandler();
		}
	}, {
		key: 'onMouseUp',
		value: function onMouseUp(e) {
			this.mouseDown = false;

			document.body.removeEventListener('mousemove', this.mouseMoveHandler);
			document.body.removeEventListener('mouseup', this.mouseUpHandler);

			document.body.classList.remove('is-scratching');

			// update discRotation, used in `motorLoop()`
			this.discRotation = this.radians.rotated * TO_DEGREE;

			this.touchEndHandler(this.progress);
		}

		// http://gamedev.stackexchange.com/questions/4467/comparing-angles-and-working-out-the-difference
		// http://stackoverflow.com/questions/2500430/calculating-rotation-in-360-deg-situations

	}, {
		key: 'onMouseMove',
		value: function onMouseMove(e) {
			var mousePosition = this.getDiscMousePosition(e);
			var mouseAngle = Math.atan2(mousePosition.y - this.midY, mousePosition.x - this.midX);

			var diffAngle = this.getAngleDiff(this.radians.mouse, mouseAngle);
			var newRotation = this.radians.rotated + diffAngle;

			if (newRotation <= 0 || newRotation >= this.radians.total) {
				return;
			}

			this.radians.rotated = newRotation;
			this.radians.mouse = mouseAngle;

			this.rotateDisc(this.radians.rotated);
			if (!this.isFalsePositive(diffAngle)) {
				var progress = this.progress;
				var avgDiff = this.getAverageDiff(diffAngle);

				this.rotateArm(progress);
				this.touchMoveHandler(avgDiff, progress);
			}
		}

		/**
   * mouseMove is very sensitive. When scratching forward and the pointer moves 1 pixel backwards,
   * the script things we want to reverse. To prevent this, check if the last (x) pixels were
   * in the same direction.
   *
   * @param {Number} angleChange the change in angle during mouseMove
   * @param {Number} treshold minumum required number of changes in the same direction
   * @return {Bool}
   */

	}, {
		key: 'isFalsePositive',
		value: function isFalsePositive(angleChange) {
			var treshold = arguments.length <= 1 || arguments[1] === undefined ? 5 : arguments[1];

			this.radiansDiffHistory.unshift(angleChange);
			this.radiansDiffHistory = this.radiansDiffHistory.slice(0, this.maxHistory);

			if (this.radiansDiffHistory.length < this.maxHistory) {
				return false;
			}

			var directions = this.radiansDiffHistory.filter(function (num) {
				if (angleChange < 0) {
					return num < 0;
				}

				return num > 0;
			});

			return directions.length < treshold;
		}
	}, {
		key: 'getAverageDiff',
		value: function getAverageDiff(diff) {
			if (this.radiansDiffHistory.length === 0) {
				return diff;
			}

			// http://jsperf.com/speedy-summer-upper
			// let sum = this.radiansDiffHistory.reduce((a, b) => a + b);

			// in favor of speed
			var sum = 0;
			var length = this.radiansDiffHistory.length;
			var i = void 0;

			for (i = 0; i < length; i++) {
				sum += this.radiansDiffHistory[i];
			}

			return sum / length;
		}

		/**
   * Set rotation of disc
   *
   * @param {angle} angle to rotate to, in radians
   */

	}, {
		key: 'rotateDisc',
		value: function rotateDisc(angle) {
			this.disc.style.transform = 'rotate(' + angle * TO_DEGREE + 'deg)';
		}
	}, {
		key: 'rotateArm',
		value: function rotateArm(progress) {
			var rotation = ARM_ROTATION / 100 * progress;
			var armRotation = ARM_MIN_ROTATION + rotation;

			this.arm.style.transform = 'rotate(' + armRotation + 'deg)';
		}

		/**
   * Sets the total turns the deck can make, depending on the duration
   * TODO: update interval in a loop: http://stackoverflow.com/questions/4787431/check-fps-in-js
   *
   * @param {Number} duration the duration of the track in seconds
   */

	}, {
		key: 'setDuration',
		value: function setDuration(duration) {
			var fps = 60;
			var totalFrames = fps * duration;
			var totalRotations = totalFrames * _times2.default.motorMax;

			this.radians.total = totalRotations * TO_RADIAN;
		}
	}, {
		key: 'setImage',
		value: function setImage(imageUrl) {
			this.el.querySelector('.js-disc-image').style.backgroundImage = 'url(' + imageUrl + ')';
		}

		/**
   * called from controller. Sets rotation of the disc
   *
   * @param {Number} progress of track playback in percent
   */

	}, {
		key: 'setProgress',
		value: function setProgress(progress) {
			var rotation = this.radians.total / 100 * progress;

			this.radians.rotated = rotation;
			this.discRotation = rotation * TO_DEGREE;

			this.rotateArm(progress);
		}

		/**
   * Increases or decreases the speed of the motor
   *
   * @param {Number} tempoIncrease a percentual value. Can be negative and positive;
   */

	}, {
		key: 'setTempo',
		value: function setTempo(tempoIncrease) {
			this.motorMaxSpeed = _times2.default.motorMax + _times2.default.motorMax * 0.01 * tempoIncrease;
		}

		/**
   * Toggle state of the motor
   * If switched on, motorSpeed increases, else it decreases
   * If the powered is switched of, motorSpeed decreases slower
   *
   * @param {Bool} on if motor is switched on (true) or off (false)
   * @param {Bool} powerDown if the power went down (true) or not (false)
   */

	}, {
		key: 'toggleMotor',
		value: function toggleMotor(on) {
			var powerDown = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			cancelAnimationFrame(this.raf);

			this.motorRunning = on;

			if (powerDown === true) {
				this.motorSlope = _times2.default.powerOff;
			} else {
				this.motorSlope = on ? _times2.default.motorOn : _times2.default.motorOff;
			}

			this.motorLoop = this.motorLoop.bind(this);
			this.motorLoop();
		}
	}, {
		key: 'motorLoop',
		value: function motorLoop() {
			if (this.motorSpeed + this.motorSlope >= 0 || this.motorSpeed + this.motorSlope <= this.motorMaxSpeed) {
				this.motorSpeed += this.motorSlope;
			}

			// clamp
			this.motorSpeed = Math.min(Math.max(this.motorSpeed, 0), this.motorMaxSpeed);

			this.motorRotation += this.motorSpeed;

			this.motor.style.transform = 'rotate(' + this.motorRotation + 'deg)';

			if (!this.mouseDown) {
				this.discRotation += this.motorSpeed;
				this.radians.rotated = this.discRotation * TO_RADIAN;

				if (this.progress < 100) {
					this.rotateDisc(this.radians.rotated);
				}
			}

			if (this.motorSpeed !== 0) {
				this.raf = requestAnimationFrame(this.motorLoop);
			}
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.radians = Object.assign({}, this.radiansDefault);

			this.rotateDisc(this.radians.rotated);
			this.rotateArm(0);
		}

		/**
   * Returns normalized value of motorSpeed (0 - 1)
   *
   * @return {Number} the normalized motorSpeed
   */

	}, {
		key: 'getAngleDiff',
		value: function getAngleDiff(angleStart, angleTarget) {
			return Math.atan2(Math.sin(angleTarget - angleStart), Math.cos(angleTarget - angleStart));
		}

		// TODO:
		// find a better solution for this

	}, {
		key: 'getDiscMousePosition',
		value: function getDiscMousePosition(evt) {
			// http://stackoverflow.com/questions/8389156/what-substitute-should-we-use-for-layerx-layery-since-they-are-deprecated-in-web
			var el = evt.target;
			var x = 0;
			var y = 0;

			while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
				x += el.offsetLeft - el.scrollLeft;
				y += el.offsetTop - el.scrollTop;
				el = el.offsetParent;
			}

			x = evt.clientX - x;
			y = evt.clientY - y;

			return { x: x, y: y };
		}
	}, {
		key: 'motorSpeedFactor',
		get: function get() {
			return this.motorSpeed / _times2.default.motorMax;
		}
	}, {
		key: 'progress',
		get: function get() {
			var rotation = this.radians.rotated;
			var progress = rotation / this.radians.total * 100;

			return progress;
		}
	}]);

	return Deck;
}();

exports.default = Deck;

},{"./configs/times":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NUM_BLOCKS = 500;

var Drawer = function () {
	function Drawer() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? { selector: '.js-drawer', buffer: null } : arguments[0];

		_classCallCheck(this, Drawer);

		Object.assign(this, options);

		this.initialize();
	}

	_createClass(Drawer, [{
		key: 'initialize',
		value: function initialize() {
			this.progress = 0;
			this.isSeeking = false;
			this.pointerX = 0;

			this.el = document.querySelector(this.selector);

			if (!this.el) {
				throw new Error('Drawer: element not found');
			}

			this.canvas = this.el.querySelector('canvas');
			this.ctx = this.canvas.getContext('2d');
			this.progressBar = this.el.querySelector('.js-drawer-progress');

			this.width = this.el.offsetWidth;
			this.halfWidth = this.width * 0.5;
			this.height = 100;
			this.halfHeight = this.height * 0.5;

			this.canvas.width = this.width;
			this.canvas.height = this.height;

			this.seekStartHandler = this.seekStartHandler || this.noop;
			this.seekEndHandler = this.seekEndHandler || this.noop;
			this.seekHandler = this.seekHandler || this.noop;

			this.initEvents();
		}
	}, {
		key: 'noop',
		value: function noop() {
			// comment
		}
	}, {
		key: 'initEvents',
		value: function initEvents() {
			var _this = this;

			this.el.addEventListener('mousedown', function (e) {
				return _this.onStartSeek(e);
			});
			this.el.addEventListener('mouseup', function (e) {
				return _this.onEndSeek(e);
			});
			this.el.addEventListener('mousemove', function (e) {
				return _this.onSeek(e);
			});
		}
	}, {
		key: 'draw',
		value: function draw(buffer) {
			var channel = buffer.getChannelData(0);
			var blockStep = Math.floor(channel.length / NUM_BLOCKS);
			var blockWidth = this.width / NUM_BLOCKS;
			var negValues = [];
			var posValues = [];
			var maxValue = 0;
			var x = 0;
			var i = void 0;

			this.clear();

			// loop 1 to collect values and get maxValue...
			// https://jsfiddle.net/rfreqbh9/5/
			for (i = 0; i < NUM_BLOCKS; i++) {
				// value: PCM with a nominal range between -1 and +1
				var value = Math.abs(channel[i * blockStep]);

				if (value > maxValue) {
					maxValue = value;
				}

				posValues.push(value);
				negValues.push(-value);
			}

			this.ctx.beginPath();
			this.ctx.moveTo(0, this.halfHeight);

			// loop forwards, draw upper side
			for (i = 0; i < posValues.length; i++) {
				x += blockWidth;
				var _value = posValues[i];

				var valuePercentage = _value / maxValue * 100;
				var barHeight = this.halfHeight * 0.01 * valuePercentage;
				var y = this.halfHeight - barHeight;

				this.ctx.lineTo(x, y);
			}

			i = posValues.length;

			// loop backwards, draw under side (?)
			while (i--) {
				var _value2 = posValues[i];

				var _valuePercentage = _value2 / maxValue * 100;
				var _barHeight = this.halfHeight * 0.01 * _valuePercentage;
				var _y = this.halfHeight + _barHeight;

				this.ctx.lineTo(x, _y);
				x -= blockWidth;
			}

			var negative = 'rgba(220, 0, 0, 0.5)';
			var positive = 'rgba(0, 200, 0, 1)';

			var gradient = this.ctx.createLinearGradient(this.halfWidth, 0, this.halfWidth, this.height);

			// Add colors
			gradient.addColorStop(0, negative);
			gradient.addColorStop(0.2, negative);
			gradient.addColorStop(0.5, positive);
			gradient.addColorStop(0.8, negative);
			gradient.addColorStop(1, negative);

			// Fill with gradient
			this.ctx.fillStyle = gradient;

			this.ctx.lineTo(0, this.halfHeight);
			this.ctx.fill();
			this.ctx.closePath();
		}
	}, {
		key: 'drawValues',
		value: function drawValues(valuesArray, maxValue) {
			var blockWidth = this.width / NUM_BLOCKS;
			var x = 0;
			var i = void 0;

			for (i = 0; i < valuesArray.length; i++) {
				var value = valuesArray[i];

				var valuePercentage = value / maxValue * 100;
				var barHeight = this.halfHeight * 0.01 * valuePercentage;
				var y = this.halfHeight - barHeight;

				this.ctx.lineTo(x, y);
				x += blockWidth;
			}
		}
	}, {
		key: 'getBarColor',
		value: function getBarColor(percentage) {
			var green = 120;

			percentage = Math.abs(percentage);

			var hue = green - green * 0.01 * percentage;

			return 'hsl(' + hue + ', 100%, 40%)';
		}
	}, {
		key: 'clear',
		value: function clear() {
			this.ctx.clearRect(0, 0, this.width, this.height);
		}
	}, {
		key: 'onStartSeek',
		value: function onStartSeek(e) {
			var clickX = e.offsetX;
			var progress = clickX / this.width * 100;

			this.isSeeking = true;
			this.pointerX = clickX;

			this.seekStartHandler(progress);
		}
	}, {
		key: 'onEndSeek',
		value: function onEndSeek(e) {
			this.isSeeking = false;
			this.seekEndHandler();
		}
	}, {
		key: 'onSeek',
		value: function onSeek(e) {
			var clickX = e.offsetX;
			var diff = Math.abs(clickX - this.pointerX);

			if (!this.isSeeking || diff < 20) {
				return;
			}

			var progress = clickX / this.width * 100;
			var diffProgress = progress - this.progress;

			this.pointerX = clickX;

			this.seekHandler(progress, diffProgress);
		}
	}, {
		key: 'update',
		value: function update(progress) {
			this.progress = progress;
			this.progressBar.style.width = progress + '%';
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.update(0);
			this.clear();
		}
	}]);

	return Drawer;
}();

exports.default = Drawer;

},{}],5:[function(require,module,exports){
'use strict';

var _controller = require('./controller');

var _controller2 = _interopRequireDefault(_controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var controllers = {};

controllers.left = new _controller2.default('.js-controller-left');
window.controllers = controllers;

function onVisibilityChange(e) {
	var isActive = !document.hidden;

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = Object.keys(controllers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var controllerName = _step.value;

			controllers[controllerName].setIsActive(isActive);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}
}

document.addEventListener('visibilitychange', onVisibilityChange);

var CTRL = 17;

function onKeyDown(e) {
	if (e.which === CTRL) {
		controllers.left.mute();
	}
}

function onKeyUp(e) {
	if (e.which === CTRL) {
		controllers.left.mute(false);
	}
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// SKIN SHIZZLE
var stylesheet = document.getElementById('skin');
var styleSelector = document.querySelector('[name=skin]');

function setSkin(skin) {
	var parts = stylesheet.href.split('/');

	parts[parts.length - 1] = skin + '.css';

	stylesheet.href = parts.join('/');

	localStorage.setItem('skin', skin);
}

styleSelector.addEventListener('change', function (e) {
	var skin = e.target.value;

	setSkin(skin);
});

if (localStorage.getItem('skin')) {
	var skin = localStorage.getItem('skin');

	styleSelector.value = skin;
	setSkin(skin);
}

},{"./controller":2}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates a slider (duh)
 *
 * Returns the DOMNode with which the slider was created
 */

var Slider = function () {
	function Slider(selector) {
		var values = arguments.length <= 1 || arguments[1] === undefined ? { min: 0, max: 1 } : arguments[1];

		_classCallCheck(this, Slider);

		this.values = values;

		this.slider = document.querySelector(selector);
		this.handle = this.slider.querySelector('.js-handle');

		this.sliderRect = this.slider.getBoundingClientRect();
		this.handleRect = this.handle.getBoundingClientRect();

		this.sliderWidth = this.sliderRect.width;
		this.sliderHeight = this.sliderRect.height;
		this.handleHalfWidth = this.handleRect.width * 0.5;
		this.handleHalfHeight = this.handleRect.height * 0.5;

		this.direction = this.slider.getAttribute('data-horizontal') ? 'h' : 'v';

		if (this.direction === 'h') {
			this.styleProp = 'left';
			this.offset = this.sliderRect.left;
			this.currentPos = this.sliderRect.width * 0.5;
			this.minValue = 0;
			this.maxValue = this.sliderWidth;
		} else {
			this.styleProp = 'top';
			this.offset = this.sliderRect.top + window.scrollY;
			this.currentPos = this.sliderRect.height * 0.5;
			this.minValue = this.handleHalfHeight;
			this.maxValue = this.sliderHeight - this.handleRect.height;
		}

		this.slideEvent = new Event('change');

		this.setScopes();
		this.addEventListeners();
		this.updatePosition();

		return this.slider;
	}

	_createClass(Slider, [{
		key: 'setScopes',
		value: function setScopes() {
			var methods = ['handleClick', 'handleRelease', 'sliderMouseOver', 'sliderMouseOut', 'sliderMouseWheel', 'sliderMouseClick', 'handleMove'];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = methods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var method = _step.value;

					this[method] = this[method].bind(this);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: 'addEventListeners',
		value: function addEventListeners() {
			this.handle.addEventListener('mousedown', this.handleClick);
			this.slider.addEventListener('mouseover', this.sliderMouseOver);
			this.slider.addEventListener('mouseout', this.sliderMouseOut);
			this.slider.addEventListener('click', this.sliderMouseClick);
		}
	}, {
		key: 'updatePosition',
		value: function updatePosition() {
			// clamp
			this.currentPos = Math.min(Math.max(this.currentPos, this.minValue), this.maxValue + this.minValue);

			this.handle.style[this.styleProp] = this.currentPos + 'px';

			this.dispatchChangeEvent();
		}
	}, {
		key: 'dispatchChangeEvent',
		value: function dispatchChangeEvent() {
			var percent = (this.currentPos - this.minValue) / this.maxValue * 100;

			if (this.direction === 'v') {
				percent = 100 - percent;
			}

			var valuesDiff = this.values.max - this.values.min;
			var value = valuesDiff * 0.01 * percent + this.values.min;

			value = parseFloat(value.toFixed(2));
			percent = parseFloat(percent.toFixed(2));

			this.slideEvent.detail = { percent: percent, value: value };
			this.slider.dispatchEvent(this.slideEvent);
		}
	}, {
		key: 'sliderMouseWheel',
		value: function sliderMouseWheel(e) {
			e.preventDefault();

			var speed = this.direction === 'h' ? -5 : 5;

			if (e.deltaY < 0) {
				speed = -speed;
			}

			this.currentPos += speed;

			this.updatePosition();
		}
	}, {
		key: 'sliderMouseOver',
		value: function sliderMouseOver() {
			this.slider.addEventListener('mousewheel', this.sliderMouseWheel);
		}
	}, {
		key: 'sliderMouseOut',
		value: function sliderMouseOut() {
			this.slider.removeEventListener('mousewheel', this.sliderMouseWheel);
		}
	}, {
		key: 'sliderMouseClick',
		value: function sliderMouseClick(e) {
			var clickOffset = void 0;

			if (this.direction === 'h') {
				clickOffset = e.pageX - this.offset;
			} else {
				clickOffset = e.pageY - this.offset - this.handleHalfHeight * 0.5;
			}

			this.currentPos = clickOffset;
			this.updatePosition();
		}
	}, {
		key: 'handleMove',
		value: function handleMove(e) {
			var newOffset = void 0;

			if (this.direction === 'h') {
				newOffset = e.pageX - this.handleHalfHeight;
			} else {
				newOffset = e.pageY;
			}

			this.currentPos = newOffset - this.offset;
			this.updatePosition();
		}
	}, {
		key: 'handleClick',
		value: function handleClick(e) {
			document.addEventListener('mousemove', this.handleMove);
			document.addEventListener('mouseup', this.handleRelease);
		}
	}, {
		key: 'handleRelease',
		value: function handleRelease() {
			document.removeEventListener('mousemove', this.handleMove);
			document.removeEventListener('mouseup', this.handleRelease);
		}
	}]);

	return Slider;
}();

exports.default = Slider;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _times = require('../configs/times');

var _times2 = _interopRequireDefault(_times);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// the max duration of a tape in MS
var SAMPLE_DURATION = _times2.default.sampleTime;

var SampleCreator = function () {
		// eslint-disable-line no-unused-vars
		/**
   * Create possibly mutiple tapes from 1 buffer
   *
   * @param {AudioContext} ctx An AudioContext instance
   * @param {AudioBuffer} buffer The audioBuffer to create sources from
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
   */

		function SampleCreator(ctx, buffer) {
				_classCallCheck(this, SampleCreator);

				this.ctx = ctx;
				this.buffer = buffer;

				this.bufferReversed = this.ctx.createBuffer(1, this.buffer.length, this.buffer.sampleRate);
				this.bufferReversed.getChannelData(0).set(this.buffer.getChannelData(0).slice().reverse());

				this.durationTotal = buffer.duration;

				this.source = null;
				this.duration = 0;
				this.offset = 0;
		}

		/**
   * Create a tape
   *
   * @param {int} startTime the start time of the tape in MS
   * @param {bool} reversed if the tape should play in reverse
   * @return {AudioBufferSourceNode} tape the source to play
   */


		_createClass(SampleCreator, [{
				key: 'create',
				value: function create() {
						var startTime = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
						var reversed = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
						var sampleDuration = arguments.length <= 2 || arguments[2] === undefined ? SAMPLE_DURATION : arguments[2];

						if (startTime > this.durationTotal || startTime < 0) {
								throw new Error('getTape: startTime can\'t be higher than duration or lower than 0 (' + startTime + ', ' + this.durationTotal + ')');
						}

						var totalDuration = this.buffer.duration;
						var sampleRate = this.ctx.sampleRate;

						var startTimeSec = startTime;
						var durationSec = sampleDuration;

						// +- 2MS faster than `Math.min`
						if (startTimeSec + durationSec > totalDuration) {
								durationSec = totalDuration - startTimeSec;
						}

						var duration = durationSec * sampleRate;
						var sourceBuffer = void 0;
						var offset = void 0;

						if (reversed) {
								offset = this.durationTotal - startTimeSec;
								sourceBuffer = this.bufferReversed;
						} else {
								offset = startTimeSec;
								sourceBuffer = this.buffer;
						}

						offset *= sampleRate;

						var length = offset + duration - 1;
						var tapeBuffer = this.ctx.createBuffer(1, duration, this.ctx.sampleRate);
						var bufferArray = sourceBuffer.getChannelData(0).slice(offset, length);

						tapeBuffer.getChannelData(0).set(bufferArray);

						this.source = this.createSource(tapeBuffer);
						this.duration = duration / this.ctx.sampleRate;

						this.offset = startTime;

						return this.source;
				}

				/**
     * Create a `AudioBufferSourceNode` from the provided buffer
     *
     * @param {AudioBuffer} buffer the buffer to create to source node with
     * @return {AudioBufferSourceNode} the created sourceNode
     */

		}, {
				key: 'createSource',
				value: function createSource(buffer) {
						var source = this.ctx.createBufferSource();

						source.buffer = buffer;
						source.loop = false;

						return source;
				}
		}]);

		return SampleCreator;
}();

exports.default = SampleCreator;

},{"../configs/times":1}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BufferLoader = function () {
	/**
  * @param {AudioContext} ctx an optional audiocontext
  */

	function BufferLoader() {
		var ctx = arguments.length <= 0 || arguments[0] === undefined ? new AudioContext() : arguments[0];

		_classCallCheck(this, BufferLoader);

		this.ctx = ctx;

		this.request = null;
	}

	_createClass(BufferLoader, [{
		key: 'noop',
		value: function noop() {}
		// placeholder


		/**
   * Load an URL into a buffer
   *
   * @param {String} url audio file to load
   * @param {Function} callback resolve function
   * @param {Object} scope scope to bind callback to
   * @return {XMLHttpRequest} request the current request used
   */

	}, {
		key: 'load',
		value: function load() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var url = options.url;
			var scope = options.scope || this;

			this.progressCallback = (options.progressCallback || this.noop).bind(scope);
			this.succesCallback = (options.succesCallback || this.noop).bind(scope);

			this.request = new XMLHttpRequest();

			this.request.responseType = 'arraybuffer';
			this.request.open('GET', url, true);

			console.log('this.request.open ' + url);

			this.request.addEventListener('progress', this.onRequestProgress.bind(this));
			this.request.addEventListener('load', this.onRequestLoaded.bind(this));

			this.request.send();

			return this.request;
		}
	}, {
		key: 'onRequestProgress',
		value: function onRequestProgress(e) {
			if (e.lengthComputable) {
				var total = e.total;
				var loaded = e.loaded;
				var percent = (loaded / total * 100).toFixed(2);

				this.progressCallback(percent);
			} else {
				this.progressCallback('loading...');
			}
		}
	}, {
		key: 'onRequestLoaded',
		value: function onRequestLoaded(e) {
			var response = e.target.response;

			this.decodeAudioData(response);
		}

		/**
   * Decode arrayBuffer
   *
   *
   * @param {LoadEvent} load event as result of XMLHttpRequest
   */

	}, {
		key: 'decodeAudioData',
		value: function decodeAudioData(response) {
			console.log('decoding...');
			this.ctx.decodeAudioData(response).then(this.succesCallback, function () {
				throw new Error('error in decoding audio');
			});
		}
	}]);

	return BufferLoader;
}();

exports.default = BufferLoader;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * FPS Meter
 * Ripped from:
 * http://stackoverflow.com/questions/4787431/check-fps-in-js
 */

var FPSMeter = function () {
		function FPSMeter() {
				_classCallCheck(this, FPSMeter);

				this.filterStrength = 1 / 10;
				this.frameTime = 0;
				this.lastTime = new Date(); // performance.now();

				this._fps = 0;
		}

		_createClass(FPSMeter, [{
				key: "fps",
				get: function get() {
						// let now = performance.now();

						// this._fps = 1000 / (now - this.lastTime);

						// this.lastTime = now;

						// return this._fps;

						var now = new Date();
						var delay = now - this.lastTime;
						this._fps += (delay - this._fps) / 10;
						this.lastTime = now;

						return 1000 / this._fps;
				}
		}]);

		return FPSMeter;
}();

var fpsMeter = new FPSMeter();

exports.default = fpsMeter;

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxjb25maWdzXFx0aW1lcy5qcyIsInNyY1xcanNcXGNvbnRyb2xsZXIuanMiLCJzcmNcXGpzXFxkZWNrLmpzIiwic3JjXFxqc1xcZHJhd2VyLmpzIiwic3JjXFxqc1xcbWFpbi5qcyIsInNyY1xcanNcXHVpXFxzbGlkZXIuanMiLCJzcmNcXGpzXFx1dGlsc1xcU2FtcGxlQ3JlYXRvci5qcyIsInNyY1xcanNcXHV0aWxzXFxidWZmZXJMb2FkZXIuanMiLCJzcmNcXGpzXFx1dGlsc1xcZnBzbWV0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0dBLElBQU0sUUFBUTtBQUNiLFVBQVMsSUFESTtBQUViLFdBQVUsQ0FBQyxJQUZFOzs7O0FBTWIsV0FBVSxDQU5HO0FBT2Isa0JBQWlCLEVBUEo7O0FBU2IsV0FBVSxDQUFDLEtBVEU7QUFVYixjQUFhLEdBVkE7QUFXYixhQUFZO0FBWEMsQ0FBZDs7a0JBY2UsSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1lmOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUFHQSxJQUFNLGVBQWUsa0NBQXJCOzs7QUFHQSxJQUFNLGNBQWM7QUFDbkIsVUFBUyxLQURVO0FBRW5CLFdBQVUsS0FGUztBQUduQixhQUFZLEtBSE87O0FBS25CLFNBQVEsSUFMVztBQU1uQixXQUFVLENBTlMsRTtBQU9uQixXQUFVLENBUFMsRTtBQVFuQixXQUFVLENBUlMsRTtBQVNuQixTQUFRO0FBVFcsQ0FBcEI7OztBQWFBLEdBQUcsVUFBSCxDQUFjLEVBQUUsV0FBVyxZQUFiLEVBQWQsRTs7SUFFTSxVO0FBQ0wscUJBQVksUUFBWixFQUFzQjtBQUFBOzs7QUFFckIsT0FBSyxFQUFMLEdBQVUsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQVY7O0FB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QUFRLEtBQUssSUFBZCxJQUFzQixFQUFuQztBQUNBLFdBQUssUUFBTCxHQUFnQixHQUFoQjs7QUFFQSxhQUFPLE9BQU8sS0FBSyxJQUFuQjtBQUNBOzs7Ozs7QUFHRixJQUFNLFdBQVcsSUFBSSxRQUFKLEVBQWpCOztrQkFFZSxRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIFttb3Rvck1heCwgc2NyYXRjaE11bHRpcGx5XSAtIGR1cmF0aW9uIHNlY1xyXG4vLyBbMywgMzBdIC0gMTAwXHJcblxyXG5jb25zdCB0aW1lcyA9IHtcclxuXHRtb3Rvck9uOiAwLjA1LFxyXG5cdG1vdG9yT2ZmOiAtMC4wNSxcclxuXHJcblx0Ly8gY2hhbmdpbmcgbW90b3Igc3BlZWQgY2hhbmdlcyBzY3JhdGNoIGVmZmVjdC5cclxuXHQvLyBDaGFuZ2Ugc2NyYXRjaE11bHRpcGx5IHRvb1xyXG5cdG1vdG9yTWF4OiAzLFxyXG5cdHNjcmF0Y2hNdWx0aXBseTogMzAsXHJcblxyXG5cdHBvd2VyT2ZmOiAtMC4wMDUsXHJcblx0c2NyYXRjaFJhbXA6IDAuMSxcclxuXHRzYW1wbGVUaW1lOiAyXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0aW1lcztcclxuIiwiLyoqXHJcbiAqIFRPRE86XHJcbiAqIE5pY2UgdGVzdCBNUDM6IGh0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzQ4MTkzOC9GaW5kX015X1dheV9Ib21lLm1wM1xyXG4gKiBXaGVuIHNjcmF0Y2hpbmcsIHRoZSBzcGVlZCB2YXJpZXMgdmVyeSBtdWNoXHJcbiAqIFRha2UgYXZlcmFnZSBvZiBzcGVlZFxyXG4gKiBOb3RlOiBkaWRuJ3Qgd29yayBvdXQgbmljZSwgc2VlICMyMTRcclxuICpcclxuICogV2hlbiBhIG5ldyBzYW1wbGUgaXMgY3JlYXRlZCwgYSAncGxvcCcgY2FuIG9jY3VyZVxyXG4gKiBNYXliZSBjcmVhdGUgYSBuZXcgc291cmNlIG9uZSBzZWNvbmQgYmVmb3JlIGVuZCBhbmQgZmFkZSBpdCBpblxyXG4gKlxyXG4gKiBEcmFnIC0gdGhyb3cgLSB2ZWxvY2l0eVxyXG4gKlxyXG4gKiBCVUdTXHJcbiAqIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEwNjk4MjVcclxuICogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNzAyNzY5NC9hdWRpby1hcGktc2V0dmFsdWVjdXJ2ZWF0dGltZS1maXJlZm94LzM3MDMwMjkzIzM3MDMwMjkzXHJcbiAqXHJcbiAqIFByb2JsZW1zIGluIEZGOlxyXG4gKiAtIGFmdGVyIHBsYXliYWNrUmF0ZSByZWFjaGVzIDAsIGl0IHJlc2V0cyB0byAxXHJcbiAqIC0gb25seSB0aGUgZmlyc3Qgc2V0IHZhbHVlIG9mIGFuIEF1ZGlvUGFyYW0gaXMgcmV0dXJuZWQ6XHJcbiAqICAgICAgLSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD04OTMwMjBcclxuICogICAgICAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTExNzE0MzhcclxuICogICAgICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9XZWJBdWRpby93ZWItYXVkaW8tYXBpL2lzc3Vlcy8zMThcclxuICpcclxuICogICAgICAtIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwLjU7XHJcbiAqICAgICAgLSBnYWluTm9kZS5nYWluLnZhbHVlID0gMTtcclxuICogICAgICAtIGNvbnNvbGUubG9nKGdhaW5Ob2RlLmdhaW4udmFsdWUpIC0+IDAuNVxyXG4gKi9cclxuXHJcbi8vIGltcG9ydHNcclxuaW1wb3J0IHRpbWVDb25maWdzIGZyb20gJy4vY29uZmlncy90aW1lcyc7XHJcbmltcG9ydCBTYW1wbGVDcmVhdG9yIGZyb20gJy4vdXRpbHMvU2FtcGxlQ3JlYXRvcic7XHJcbmltcG9ydCBmcHNNZXRlciBmcm9tICcuL3V0aWxzL2Zwc21ldGVyJztcclxuaW1wb3J0IEJ1ZmZlckxvYWRlciBmcm9tICcuL3V0aWxzL2J1ZmZlckxvYWRlcic7XHJcbmltcG9ydCBTbGlkZXIgZnJvbSAnLi91aS9zbGlkZXInO1xyXG5pbXBvcnQgRGVjayBmcm9tICcuL2RlY2snO1xyXG5pbXBvcnQgRHJhd2VyIGZyb20gJy4vZHJhd2VyJztcclxuXHJcbi8vIHNvbWUgY29uc3RhbnRzXHJcbmNvbnN0IFNDX0NMSUVOVF9JRCA9ICcyYzY4NjllNGE0NThkMjY4NjVhMmExMTA0MGM1YTYyMyc7XHJcblxyXG4vLyBkZWZhdWx0IHN0YXRlIG9mIHRyYWNrXHJcbmNvbnN0IFRSQUNLX1NUQVRFID0ge1xyXG5cdHN0YXJ0ZWQ6IGZhbHNlLFxyXG5cdHJldmVyc2VkOiBmYWxzZSxcclxuXHRzY3JhdGNoaW5nOiBmYWxzZSxcclxuXHJcblx0c291cmNlOiBudWxsLFxyXG5cdGR1cmF0aW9uOiAwLCAvLyB0b3RhbCBkdXJhdGlvbiBvZiBzb3VyY2UgaW4gTVNcclxuXHRwb3NpdGlvbjogMCwgLy8gY3VycmVudCBwbGF5YmFjayBwb3NpdGlvbiBvZiBzb3VyY2UgaW4gTVNcclxuXHRwcm9ncmVzczogMCwgLy8gcGxheWJhY2sgcHJvZ3Jlc3Mgb2Ygc291cmNlIGluICUgKDAgLSAxMDApXHJcblx0dm9sdW1lOiAxXHJcbn07XHJcblxyXG4vLyBpbml0aWFsaXplIHNvdW5kQ2xvdWRcclxuU0MuaW5pdGlhbGl6ZSh7IGNsaWVudF9pZDogU0NfQ0xJRU5UX0lEIH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxyXG5cclxuY2xhc3MgQ29udHJvbGxlciB7XHJcblx0Y29uc3RydWN0b3Ioc2VsZWN0b3IpIHtcclxuXHRcdC8vIHJlZmVyZW5jZXMgRE9NIGVsZW1lbnRzXHJcblx0XHR0aGlzLmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcblxyXG5cdFx0dGhpcy5kb20gPSB0aGlzLmdldERvbUVsZW1lbnRzKCk7XHJcblxyXG5cdFx0Ly8gYXVkaW9Db250ZXh0IGFuZCB2b2x1bWUgY29udHJvbGxlclxyXG5cdFx0dGhpcy5hdWRpb0N0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcclxuXHRcdHRoaXMuZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ3R4LmNyZWF0ZUdhaW4oKTtcclxuXHRcdHRoaXMuY29udm9sdmVyID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVDb252b2x2ZXIoKTtcclxuXHJcblx0XHQvLyBidWZmZXIgbG9hZGVyIHRvIGxvYWQgYW5kIGRlY29kZSBhdWRpbyBmaWxlc1xyXG5cdFx0dGhpcy5idWZmZXJMb2FkZXIgPSBuZXcgQnVmZmVyTG9hZGVyKHRoaXMuYXVkaW9DdHgpO1xyXG5cclxuXHRcdC8vIGNvbXBsZXRlIGJ1ZmZlciBvZiB0aGUgdHJhY2tcclxuXHRcdC8vIGdldHMgYXNzaWduZWQgYWZ0ZXIgdHJhY2sgaXMgbG9hZGVkXHJcblx0XHR0aGlzLmdsb2JhbFNvdXJjZUJ1ZmZlciA9IG51bGw7XHJcblxyXG5cdFx0Ly8gdXNlZCBpbiB0aW1lclxyXG5cdFx0dGhpcy50aW1lclRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcblxyXG5cdFx0Ly8gc3RhdGUgb2YgdGhlIHBsYXlpbmcgdHJhY2tcclxuXHRcdHRoaXMudHJhY2sgPSB0aGlzLmRlZmF1bHRUcmFja1N0YXRlO1xyXG5cclxuXHRcdHRoaXMubW90b3JSdW5uaW5nID0gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy5sYXN0RnBzID0gMDtcclxuXHJcblx0XHQvLyBiaW5kIHRoZSBtZXRob2RzIHRvIGB0aGlzYCBzY29wZVxyXG5cdFx0dGhpcy5zZXRTY29wZXMoKTtcclxuXHJcblx0XHQvLyBjb21wb25lbnRzXHJcblx0XHR0aGlzLmRlY2sgPSBuZXcgRGVjayh7XHJcblx0XHRcdHNlbGVjdG9yOiAnLmpzLXR1cm50YWJsZScsXHJcblx0XHRcdHRvdWNoU3RhcnRIYW5kbGVyOiB0aGlzLm9uRGVja1RvdWNoLmJpbmQodGhpcyksXHJcblx0XHRcdHRvdWNoRW5kSGFuZGxlcjogdGhpcy5vbkRlY2tSZWxlYXNlLmJpbmQodGhpcyksXHJcblx0XHRcdHRvdWNoTW92ZUhhbmRsZXI6IHRoaXMub25EZWNrTW92ZS5iaW5kKHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmRyYXdlciA9IG5ldyBEcmF3ZXIoe1xyXG5cdFx0XHRzZWxlY3RvcjogJy5qcy1kcmF3ZXInLFxyXG5cdFx0XHRzZWVrU3RhcnRIYW5kbGVyOiB0aGlzLm9uU2Vla0hhbmRsZXIuYmluZCh0aGlzKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gY3JlYXRlZCBldmVyeXRpbWUgYSB0cmFjayBpcyBsb2FkZWRcclxuXHRcdHRoaXMuc2FtcGxlQ3JlYXRvciA9IG51bGw7XHJcblxyXG5cdFx0dGhpcy5sb2FkU291bmRDbG91ZFRyYWNrKHRoaXMuZG9tLnNlbGVjdFRyYWNrLnZhbHVlKTtcclxuXHRcdC8vIHRoaXMubG9hZFVybCgnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vNDgxOTM4L0ZpbmRfTXlfV2F5X0hvbWUubXAzJyk7XHJcblx0fVxyXG5cclxuXHRvbkNsaWNrTG9hZFRyYWNrKCkge1xyXG5cdFx0bGV0IHVybCA9IHRoaXMuZG9tLmlucHV0VHJhY2sudmFsdWU7XHJcblxyXG5cdFx0Ly8gcmVzZXQgZHJvcGRvd25cclxuXHRcdHRoaXMuZG9tLnNlbGVjdFRyYWNrLnZhbHVlID0gJyc7XHJcblxyXG5cdFx0dGhpcy5sb2FkVHJhY2sodXJsKTtcclxuXHR9XHJcblxyXG5cdG9uU2VsZWN0VHJhY2soZSkge1xyXG5cdFx0dGhpcy5sb2FkVHJhY2soZS50YXJnZXQudmFsdWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRqdXN0IHRlbXBvIG9mIHRoZSBtb3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtDdXN0b21FdmVudH0gd2l0aCB0aGUgcHJvcGVydGllcyBgcGVyY2VudGAgYW5kIGB2YWx1ZWBcclxuXHQgKi9cclxuXHRvblNldFRlbXBvKGUpIHtcclxuXHRcdGxldCBkZXRhaWwgPSBlLmRldGFpbDtcclxuXHRcdGxldCB0ZW1wb1ZhbHVlID0gZGV0YWlsLnZhbHVlO1xyXG5cclxuXHRcdHRoaXMuZGVjay5zZXRUZW1wbyh0ZW1wb1ZhbHVlKTtcclxuXHR9XHJcblxyXG5cdG9uUmV2ZXJiQ2hhbmdlKGUpIHtcclxuXHRcdGxldCB0YXJnZXQgPSBlLnRhcmdldDtcclxuXHRcdGxldCByZXZlcmJOYW1lID0gdGFyZ2V0LnZhbHVlO1xyXG5cclxuXHRcdGlmIChyZXZlcmJOYW1lID09PSAnJykge1xyXG5cdFx0XHR0aGlzLmRpc2Nvbm5lY3RDb252b2x2ZXIoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGxldCB1cmwgPSBgZGlzdC9zb3VuZHMvcmV2ZXJicy8ke3JldmVyYk5hbWV9LndhdmA7XHJcblxyXG5cdFx0XHQvLyB1cmwsIHRoaXMub25SZXZlcmJMb2FkZWQsIHRoaXNcclxuXHRcdFx0dGhpcy5idWZmZXJMb2FkZXIubG9hZCh7XHJcblx0XHRcdFx0dXJsLFxyXG5cdFx0XHRcdHN1Y2Nlc0NhbGxiYWNrOiB0aGlzLm9uUmV2ZXJiTG9hZGVkLFxyXG5cdFx0XHRcdHNjb3BlOiB0aGlzXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0b25SZXZlcmJMb2FkZWQoZGVjb2RlZEJ1ZmZlcikge1xyXG5cdFx0Y29uc29sZS5sb2coJ3JldmVyYiBsb2FkZWQnKTtcclxuXHJcblx0XHR0aGlzLmNvbnZvbHZlci5idWZmZXIgPSBkZWNvZGVkQnVmZmVyO1xyXG5cclxuXHRcdC8vIGhhY2t5IGhhY2t5IHF1aWNrIGFuZCBkaXJ0eVxyXG5cdFx0dGhpcy5jb25uZWN0Q29udm9sdmVyKCk7XHJcblx0fVxyXG5cclxuXHRjb25uZWN0Q29udm9sdmVyKCkge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0dGhpcy5kaXNjb25uZWN0Q29udm9sdmVyKCk7XHJcblx0XHR9IGNhdGNoIChlKSB7IH1cclxuXHJcblx0XHR0aGlzLmdhaW5Ob2RlLmRpc2Nvbm5lY3QodGhpcy5hdWRpb0N0eC5kZXN0aW5hdGlvbik7XHJcblx0XHR0aGlzLmdhaW5Ob2RlLmNvbm5lY3QodGhpcy5jb252b2x2ZXIpO1xyXG5cdFx0dGhpcy5jb252b2x2ZXIuY29ubmVjdCh0aGlzLmF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcclxuXHR9XHJcblxyXG5cdGRpc2Nvbm5lY3RDb252b2x2ZXIoKSB7XHJcblx0XHR0aGlzLmNvbnZvbHZlci5kaXNjb25uZWN0KHRoaXMuYXVkaW9DdHguZGVzdGluYXRpb24pO1xyXG5cdFx0dGhpcy5nYWluTm9kZS5kaXNjb25uZWN0KHRoaXMuY29udm9sdmVyKTtcclxuXHRcdHRoaXMuZ2Fpbk5vZGUuY29ubmVjdCh0aGlzLmF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcclxuXHR9XHJcblxyXG5cdGxvYWRUcmFjayh1cmwpIHtcclxuXHRcdGlmICghdXJsKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnN0b3AoKTtcclxuXHRcdHRoaXMucmVzZXQoKTtcclxuXHJcblx0XHRpZiAodXJsLmluZGV4T2YoJ3NvdW5kY2xvdWQnKSA9PT0gLTEpIHtcclxuXHRcdFx0dGhpcy5sb2FkVXJsKHVybCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmxvYWRTb3VuZENsb3VkVHJhY2sodXJsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWRzIHNvdW5kY2xvdWQgZGF0YSBieSBhIHNvdW5kY2xvdWQgdHJhY2sgVVJMXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNvdW5kQ2xvdWRVcmwgdGhlIHNvdW5kQ2xvdWQgdHJhY2sgVVJMXHJcblx0ICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXJzLnNvdW5kY2xvdWQuY29tL2RvY3MvYXBpL3Nka3N9XHJcblx0ICovXHJcblx0bG9hZFNvdW5kQ2xvdWRUcmFjayhzb3VuZENsb3VkVXJsKSB7XHJcblx0XHRjb25zb2xlLmxvZyhgcmVzb2x2aW5nIFNDLi4uICR7c291bmRDbG91ZFVybH1gKTtcclxuXHJcblx0XHRTQy5yZXNvbHZlKHNvdW5kQ2xvdWRVcmwpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdGxldCBzdHJlYW1VcmwgPSBgJHtyZXNwb25zZS5zdHJlYW1fdXJsfT9jbGllbnRfaWQ9JHtTQ19DTElFTlRfSUR9YDtcclxuXHRcdFx0bGV0IGltYWdlVXJsID0gcmVzcG9uc2UuYXJ0d29ya191cmxcclxuXHRcdFx0XHQ/IHJlc3BvbnNlLmFydHdvcmtfdXJsLnJlcGxhY2UoJ2xhcmdlJywgJ2Nyb3AnKVxyXG5cdFx0XHRcdDogJyc7XHJcblxyXG5cdFx0XHR0aGlzLmRlY2suc2V0SW1hZ2UoaW1hZ2VVcmwpO1xyXG5cclxuXHRcdFx0dGhpcy5sb2FkVXJsKHN0cmVhbVVybCk7XHJcblx0XHR9LCAoZXJyKSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdlcnJvcicsIGVycik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIFhNTEh0dHBSZXF1ZXN0IHRvIGxvYWQgYSBVUkwgYXMgYXJyYXlidWZmZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCBvZiB0aGUgdHJhY2sgdG8gbG9hZFxyXG5cdCAqIEBzZWUge0BsaW5rIGh0dHBzOi8vd3d3LmFpcnRpZ2h0aW50ZXJhY3RpdmUuY29tL2RlbW9zL2pzL3ViZXJ2aXovYXVkaW9hbmFseXNpcy9qcy9BdWRpb0hhbmRsZXIuanN9XHJcblx0ICovXHJcblx0bG9hZFVybCh1cmwpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdsb2FkaW5nIGJ1ZmZlci4uLicpO1xyXG5cclxuXHRcdHRoaXMuYnVmZmVyTG9hZGVyLmxvYWQoe1xyXG5cdFx0XHR1cmwsXHJcblx0XHRcdHN1Y2Nlc0NhbGxiYWNrOiB0aGlzLm9uQXVkaW9EZWNvZGVkLFxyXG5cdFx0XHRwcm9ncmVzc0NhbGxiYWNrOiB0aGlzLm9uVHJhY2tMb2FkaW5nLFxyXG5cdFx0XHRzY29wZTogdGhpc1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvbkF1ZGlvRGVjb2RlZChkZWNvZGVkQnVmZmVyKSB7XHJcblx0XHRjb25zb2xlLmxvZygnZGVjb2RpbmcgZG9uZSEnKTtcclxuXHJcblx0XHR0aGlzLmdsb2JhbFNvdXJjZUJ1ZmZlciA9IGRlY29kZWRCdWZmZXI7XHJcblxyXG5cdFx0dGhpcy5pbml0U2FtcGxlKGRlY29kZWRCdWZmZXIpO1xyXG5cclxuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG5cdH1cclxuXHJcblx0b25UcmFja0xvYWRpbmcocHJvZ3Jlc3MpIHtcclxuXHRcdC8vIGNvbnNvbGUubG9nKHByb2dyZXNzKTtcclxuXHR9XHJcblxyXG5cdGluaXRpYWxpemUoKSB7XHJcblx0XHQvLyB1cGRhdGUgdHJhY2sgcHJvcGVydGllcyB3aXRoIG5ldyBidWZmZXIgZHVyYXRpb25cclxuXHRcdHRoaXMudHJhY2suZHVyYXRpb24gPSB0aGlzLmdsb2JhbFNvdXJjZUJ1ZmZlci5kdXJhdGlvbjtcclxuXHJcblx0XHQvLyByZXNldCB0aGUgdm9sdW1lIHRvIHRoZSBjb3JyZWN0IHN0YXRlXHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSB0aGlzLnRyYWNrLnZvbHVtZTtcclxuXHJcblx0XHQvLyB1cGRhdGUgY29tcG9uZW50cyB3aXRoIG5ldyBkYXRhXHJcblx0XHR0aGlzLmRlY2suc2V0RHVyYXRpb24odGhpcy5nbG9iYWxTb3VyY2VCdWZmZXIuZHVyYXRpb24pO1xyXG5cdFx0dGhpcy5kcmF3ZXIuZHJhdyh0aGlzLmdsb2JhbFNvdXJjZUJ1ZmZlcik7XHJcblxyXG5cdFx0Ly8gY29ubmVjdCB0aGUgdm9sdW1lIHRvIHRoZSBkZXN0aW5hdGlvbiAoc291cmNlIGlzIGNvbm5lY3RlZCB0byB2b2x1bWUpXHJcblx0XHR0aGlzLmdhaW5Ob2RlLmNvbm5lY3QodGhpcy5hdWRpb0N0eC5kZXN0aW5hdGlvbik7XHJcblxyXG5cdFx0dGhpcy50b2dnbGVVSSh0cnVlKTtcclxuXHR9XHJcblxyXG5cclxuXHRpbml0U2FtcGxlKGJ1ZmZlcikge1xyXG5cdFx0Ly8gY3JlYXRlIGEgc2FtcGxlY3JlYXRvciB3aGljaCBjYW4gc2xpY2UgYSBhdWRpbyBidWZmZXIgaW50byBzbWFsbCBwYXJ0c1xyXG5cdFx0dGhpcy5zYW1wbGVDcmVhdG9yID0gbmV3IFNhbXBsZUNyZWF0b3IodGhpcy5hdWRpb0N0eCwgYnVmZmVyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbmNlbCBhbGwgc2NlZHVsZWQgdmFsdWUgY2hhbmdlcyBvbiB0aGUgcGxheWJhY2tSYXRlXHJcblx0ICovXHJcblx0Y2FuY2VsU2NoZWR1bGVkUGxheWJhY2tSYXRlKCkge1xyXG5cdFx0dGhpcy50cmFjay5zb3VyY2UucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aGlzLmF1ZGlvQ3R4LmN1cnJlbnRUaW1lKTtcclxuXHR9XHJcblxyXG5cdG9uU2V0Vm9sdW1lKGUpIHtcclxuXHRcdGxldCB2b2x1bWUgPSBlLnRhcmdldC52YWx1ZTtcclxuXHJcblx0XHR0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSB2b2x1bWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBmb3IgYERlY2sudG91Y2hTdGFydEhhbmRsZXJgXHJcblx0ICovXHJcblx0b25EZWNrVG91Y2goKSB7XHJcblx0XHR0aGlzLnRyYWNrLnNjcmF0Y2hpbmcgPSB0cnVlO1xyXG5cclxuXHRcdHRoaXMucGF1c2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciBgRGVjay50b3VjaEVuZEhhbmRsZXJgXHJcblx0ICovXHJcblx0b25EZWNrUmVsZWFzZShwcm9ncmVzcykge1xyXG5cdFx0dGhpcy50cmFjay5wb3NpdGlvbiA9ICh0aGlzLnRyYWNrLmR1cmF0aW9uIC8gMTAwKSAqIHByb2dyZXNzO1xyXG5cdFx0dGhpcy50cmFjay5zY3JhdGNoaW5nID0gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy5zZXRQbGF5YmFja1JhdGUoMSk7XHJcblx0XHR0aGlzLnBsYXkoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciBgRGVjay50b3VjaE1vdmVIYW5kbGVyYFxyXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHNwZWVkIHRoZSBzcGVlZCB3aGljaCB0aGUgZGVjayB3YXMgcm90YXRlZFxyXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHByb2dyZXNzIHByb2dyZXNzIG9mIHRoZSBkZWNrIGluIHBlcmNlbnRcclxuXHQgKiBAcmV0dXJuIHt2b2lkfVxyXG5cdCAqL1xyXG5cdG9uRGVja01vdmUoc3BlZWQsIHByb2dyZXNzKSB7XHJcblx0XHRsZXQgc2NyYXRjaE11bHRpcGx5ID0gdGltZUNvbmZpZ3Muc2NyYXRjaE11bHRpcGx5O1xyXG5cclxuXHRcdHRoaXMudHJhY2sucG9zaXRpb24gPSAodGhpcy50cmFjay5kdXJhdGlvbiAqIDAuMDEpICogcHJvZ3Jlc3M7XHJcblxyXG5cdFx0c3BlZWQgKj0gc2NyYXRjaE11bHRpcGx5O1xyXG5cdFx0c3BlZWQgPSBzcGVlZC50b0ZpeGVkKDIpO1xyXG5cclxuXHRcdHRoaXMuc2V0UGxheWJhY2tSYXRlKHNwZWVkLCB0cnVlLCB0cnVlLCAwLjA1KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciBgRHJhd2VyLnNlZWtTdGFydEhhbmRsZXJgXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRoZSBwcm9ncmVzcyB3aGljaCB3YXMgY2xpY2tlZCBpbiB0aGUgZHJhd2VyXHJcblx0ICogQHJldHVybiB7dm9pZH1cclxuXHQgKi9cclxuXHRvblNlZWtIYW5kbGVyKHByb2dyZXNzKSB7XHJcblx0XHR0aGlzLnRyYWNrLnBvc2l0aW9uID0gKHRoaXMudHJhY2suZHVyYXRpb24gKiAwLjAxKSAqIHByb2dyZXNzO1xyXG5cclxuXHRcdHRoaXMucGxheSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBwbGF5YmFja1JhdGUgb2YgcGxheWluZyBzb3VyY2UuIENhbiBiZSBuZWdhdGl2ZSwgemVybyBvciBwb3NpdGl2ZVxyXG5cdCAqIElmIG5lZ2F0aXZlLCB0cmFjayBpcyByZXZlcnNlZCwgaWYgemVybywgdHJhY2sgaXMgc3RvcHBpbmdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBzcGVlZCB0aGUgcGxheWJhY2sgc3BlZWQsIGRlZmF1bHRzIDFcclxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJhbXBEb3duIHJhbXAgdGhlIHNwZWVkIHRvIDAgYWZ0ZXIgcmVhY2hpbmcgYHNwZWVkYCwgZGVmYXVsdHMgZmFsc2VcclxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJhbXBVcCByYW1wIHVwIHRoZSBjdXJyZW50IHNwZWVkIHRvIGBzcGVlZGAsIGRlZmF1bHRzIGZhbHNlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgdGltZSB0byBjb21wbGV0ZSB0aGUgc3BlZWQgcmFtcCBpbiBzZWMsIGRlZmF1bHRzIHRpbWVDb25maWdzLnNjcmF0Y2hSYW1wXHJcblx0ICovXHJcblx0c2V0UGxheWJhY2tSYXRlKHNwZWVkID0gMSwgcmFtcERvd24gPSBmYWxzZSwgcmFtcFVwID0gdHJ1ZSwgdGltZSA9IHRpbWVDb25maWdzLnNjcmF0Y2hSYW1wKSB7XHJcblx0XHQvLyBOb3RlOiBmaXJlZm94IGNhbid0IGhhbmRsZSBgMGAgdmFsdWUgZm9yIHBsYXliYWNrUmF0ZVxyXG5cdFx0Ly8gYWZ0ZXIgMCBpcyByZWFjaGVkLCBpdCdzIHJlc2V0dGVkIGJhY2sgdG8gMVxyXG5cdFx0aWYgKCF0aGlzLnRyYWNrLnNvdXJjZSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGN1cnJlbnRQbGF5YmFja1JhdGUgPSB0aGlzLnRyYWNrLnNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWU7XHJcblx0XHRsZXQgYWJzb2x1dGVQbGF5YmFja1JhdGUgPSBNYXRoLmFicyhzcGVlZCk7XHJcblxyXG5cdFx0Ly8gcm91bmQgb24gMiBkZWNpbWFsc1xyXG5cdFx0YWJzb2x1dGVQbGF5YmFja1JhdGUgPSBNYXRoLnJvdW5kKGFic29sdXRlUGxheWJhY2tSYXRlICogMTAwKSAvIDEwMDtcclxuXHJcblx0XHRsZXQgc3BlZWRNaW51cyA9IHNwZWVkIDwgMDtcclxuXHRcdGxldCBzaG91bGRSZXZlcnNlID0gdGhpcy50cmFjay5yZXZlcnNlZCAhPT0gc3BlZWRNaW51cztcclxuXHJcblx0XHRpZiAoc2hvdWxkUmV2ZXJzZSkge1xyXG5cdFx0XHR0aGlzLnRyYWNrLnJldmVyc2VkID0gIXRoaXMudHJhY2sucmV2ZXJzZWQ7XHJcblx0XHRcdHRoaXMucGxheSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuY2FuY2VsU2NoZWR1bGVkUGxheWJhY2tSYXRlKCk7XHJcblxyXG5cdFx0Ly8gdG8gYmFkIGBzZXRWYWx1ZUN1cnZlQXRUaW1lYCBpcyBidWdnZWQgaW4gRkZcclxuXHRcdGlmIChyYW1wVXApIHtcclxuXHRcdFx0dGhpcy50cmFjay5zb3VyY2UucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKGN1cnJlbnRQbGF5YmFja1JhdGUsIHRoaXMuYXVkaW9DdHguY3VycmVudFRpbWUpO1xyXG5cdFx0XHR0aGlzLnRyYWNrLnNvdXJjZS5wbGF5YmFja1JhdGUubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoYWJzb2x1dGVQbGF5YmFja1JhdGUsIHRoaXMuYXVkaW9DdHguY3VycmVudFRpbWUgKyB0aW1lKTtcclxuXHJcblx0XHRcdHRpbWUgKj0gMS41O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy50cmFjay5zb3VyY2UucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKGFic29sdXRlUGxheWJhY2tSYXRlLCB0aGlzLmF1ZGlvQ3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAocmFtcERvd24pIHtcclxuXHRcdFx0dGhpcy50cmFjay5zb3VyY2UucGxheWJhY2tSYXRlLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRoaXMuYXVkaW9DdHguY3VycmVudFRpbWUgKyB0aW1lKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHNldHVwU2FtcGxlKHNhbXBsZVRpbWUgPSB0aW1lQ29uZmlncy5zYW1wbGVUaW1lKSB7XHJcblx0XHQvLyBzdGFydFRpbWUgaW4gTVNcclxuXHRcdGxldCBzdGFydFRpbWUgPSB0aGlzLnRyYWNrLnBvc2l0aW9uO1xyXG5cclxuXHRcdGlmICh0aGlzLnRyYWNrLnJldmVyc2VkKSB7XHJcblx0XHRcdHN0YXJ0VGltZSA9IHRoaXMudHJhY2suZHVyYXRpb24gLSBzdGFydFRpbWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY3JlYXRlIGEgbmV3IHNhbXBsZVxyXG5cdFx0dGhpcy50cmFjay5zb3VyY2UgPSB0aGlzLnNhbXBsZUNyZWF0b3IuY3JlYXRlKHRoaXMudHJhY2sucG9zaXRpb24sIHRoaXMudHJhY2sucmV2ZXJzZWQsIHNhbXBsZVRpbWUpO1xyXG5cclxuXHRcdC8vIGNvbm5lY3QgaXQgdG8gdGhlIHZvbHVtZVxyXG5cdFx0dGhpcy50cmFjay5zb3VyY2UuY29ubmVjdCh0aGlzLmdhaW5Ob2RlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhdXNlIHBsYXliYWNrIG9mIHRoZSB0cmFjayBieSBzZXR0aW5nIHBsYXliYWNrIHJhdGUgdG8gMFxyXG5cdCAqL1xyXG5cdHBhdXNlKCkge1xyXG5cdFx0dGhpcy5zZXRQbGF5YmFja1JhdGUoMCwgdHJ1ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNldCB0aGUgc3RhdGUgb2YgdGhlIHRyYWNrIGFuZCByZXNldCBkZWNrXHJcblx0ICovXHJcblx0cmVzZXQoKSB7XHJcblx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJhZik7XHJcblx0XHR0aGlzLm1vdG9yUnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuZGVjay50b2dnbGVNb3Rvcih0aGlzLm1vdG9yUnVubmluZyk7XHJcblx0XHR0aGlzLmRlY2sucmVzZXQoKTtcclxuXHRcdHRoaXMuZHJhd2VyLnJlc2V0KCk7XHJcblxyXG5cdFx0dGhpcy50b2dnbGVVSShmYWxzZSk7XHJcblxyXG5cdFx0dGhpcy50cmFjayA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdFRyYWNrU3RhdGUpO1xyXG5cdH1cclxuXHJcblx0dG9nZ2xlUG93ZXIoKSB7XHJcblx0XHR0aGlzLm1vdG9yUnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuZGVjay50b2dnbGVNb3Rvcih0aGlzLm1vdG9yUnVubmluZywgdHJ1ZSk7XHJcblx0fVxyXG5cclxuXHR0b2dnbGVNb3RvcigpIHtcclxuXHRcdHRoaXMubW90b3JSdW5uaW5nID0gIXRoaXMubW90b3JSdW5uaW5nO1xyXG5cclxuXHRcdHRoaXMuZGVjay50b2dnbGVNb3Rvcih0aGlzLm1vdG9yUnVubmluZyk7XHJcblxyXG5cdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yYWYpO1xyXG5cclxuXHRcdHRoaXMucGxheSgpO1xyXG5cdH1cclxuXHJcblx0c3RvcCgpIHtcclxuXHRcdGlmICh0aGlzLnRyYWNrLnNvdXJjZSkge1xyXG5cdFx0XHR0aGlzLmNhbmNlbFNjaGVkdWxlZFBsYXliYWNrUmF0ZSgpO1xyXG5cdFx0XHR0aGlzLnRyYWNrLnNvdXJjZS5zdG9wKDApO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHR0aGlzLnRyYWNrLnN0YXJ0ZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMudHJhY2sucG9zaXRpb24gPSAwO1xyXG5cclxuXHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMucmFmKTtcclxuXHR9XHJcblxyXG5cdHBsYXkoKSB7XHJcblx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJhZik7XHJcblxyXG5cdFx0dGhpcy50cmFjay5zdGFydGVkID0gdHJ1ZTtcclxuXHJcblx0XHQvLyBzdG9wIGN1cnJlbnRseSBwbGF5aW5nIHRyYWNrXHJcblx0XHRpZiAodGhpcy50cmFjay5zb3VyY2UpIHtcclxuXHRcdFx0dGhpcy50cmFjay5zb3VyY2Uuc3RvcCgwKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnNldHVwU2FtcGxlKHRpbWVDb25maWdzLnNhbXBsZVRpbWUpO1xyXG5cclxuXHRcdC8vIHRoaXMudHJhY2suc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHRoaXMudHJhY2tTcGVlZDtcclxuXHJcblx0XHR0aGlzLnRpbWVyVGltZXN0YW1wID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcblx0XHR0aGlzLnRyYWNrLnNvdXJjZS5zdGFydCgwLCAwKTtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZUxvb3AgPSB0aGlzLnVwZGF0ZUxvb3AuYmluZCh0aGlzKTtcclxuXHRcdHRoaXMudXBkYXRlTG9vcCgpO1xyXG5cdH1cclxuXHJcblx0bXV0ZShzaWxlbnQgPSB0cnVlKSB7XHJcblx0XHRsZXQgdm9sdW1lID0gc2lsZW50ID8gMCA6IDE7XHJcblxyXG5cdFx0dGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gdm9sdW1lO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyB0aGUgY3VycmVudCBwb3NpdGlvbiBhbmQgcHJvZ3Jlc3Mgb2YgdGhlIHRyYWNrXHJcblx0ICovXHJcblx0dXBkYXRlTG9vcCgpIHtcclxuXHRcdHRoaXMubGFzdEZwcyA9IGZwc01ldGVyLmZwcztcclxuXHJcblx0XHRpZiAodGhpcy50cmFjay5zdGFydGVkKSB7XHJcblx0XHRcdGxldCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuXHRcdFx0bGV0IGRpZmYgPSBub3cgLSB0aGlzLnRpbWVyVGltZXN0YW1wO1xyXG5cdFx0XHRsZXQgc3BlZWQgPSB0aGlzLnRyYWNrU3BlZWQ7XHJcblxyXG5cdFx0XHRsZXQgcmVzYW1wbGVGb3J3YXJkO1xyXG5cdFx0XHRsZXQgcmVzYW1wbGVCYWNrd2FyZDtcclxuXHJcblx0XHRcdC8vIHRha2Ugc3BlZWQgaW4gYWNjb3VudCBvZiBwbGF5YmFjayBwb3NpdGlvblxyXG5cdFx0XHRkaWZmICo9IHNwZWVkO1xyXG5cclxuXHRcdFx0Ly8gZGlmZiBmcm9tIE1TIHRvIFNcclxuXHRcdFx0ZGlmZiAqPSAwLjAwMTtcclxuXHJcblx0XHRcdHRoaXMudHJhY2sucG9zaXRpb24gKz0gZGlmZjtcclxuXHRcdFx0dGhpcy50cmFjay5wcm9ncmVzcyA9ICh0aGlzLnRyYWNrLnBvc2l0aW9uIC8gdGhpcy50cmFjay5kdXJhdGlvbikgKiAxMDA7XHJcblxyXG5cdFx0XHQvLyBUT0RPOiBjbGVhbnVwIHRoaXMgbWVzc1xyXG5cdFx0XHRpZiAoKHRoaXMudHJhY2sucG9zaXRpb24gPj0gdGhpcy50cmFjay5kdXJhdGlvbikgfHwgKHRoaXMudHJhY2sucmV2ZXJzZWQgJiYgdGhpcy50cmFjay5wb3NpdGlvbiA8PSAwKSkge1xyXG5cdFx0XHRcdHN0b3AoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXNhbXBsZUZvcndhcmQgPSB0aGlzLnRyYWNrLnBvc2l0aW9uID49IHRoaXMuc2FtcGxlQ3JlYXRvci5kdXJhdGlvbiArIHRoaXMuc2FtcGxlQ3JlYXRvci5vZmZzZXQ7XHJcblx0XHRcdFx0cmVzYW1wbGVCYWNrd2FyZCA9IHRoaXMudHJhY2sucmV2ZXJzZWQgJiYgKHRoaXMudHJhY2sucG9zaXRpb24gPD0gdGhpcy5zYW1wbGVDcmVhdG9yLm9mZnNldCAtIHRoaXMuc2FtcGxlQ3JlYXRvci5kdXJhdGlvbik7XHJcblxyXG5cdFx0XHRcdGlmIChyZXNhbXBsZUZvcndhcmQgfHwgcmVzYW1wbGVCYWNrd2FyZCkge1xyXG5cdFx0XHRcdFx0dGhpcy5wbGF5KCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0aGlzLmRyYXdlci51cGRhdGUodGhpcy50cmFjay5wcm9ncmVzcyk7XHJcblxyXG5cdFx0XHRcdGlmICghdGhpcy50cmFjay5zY3JhdGNoaW5nKSB7XHJcblx0XHRcdFx0XHR0aGlzLmRlY2suc2V0UHJvZ3Jlc3ModGhpcy50cmFjay5wcm9ncmVzcyk7XHJcblx0XHRcdFx0XHQvLyB0aGlzLnRyYWNrLnNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSB0aGlzLnRyYWNrU3BlZWQ7XHJcblx0XHRcdFx0XHR0aGlzLnRyYWNrLnNvdXJjZS5wbGF5YmFja1JhdGUuc2V0VmFsdWVBdFRpbWUodGhpcy50cmFja1NwZWVkLCB0aGlzLmF1ZGlvQ3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRoaXMudXBkYXRlT3V0cHV0KCk7XHJcblxyXG5cdFx0XHRcdHRoaXMudGltZXJUaW1lc3RhbXAgPSBub3c7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZUxvb3ApO1xyXG5cdH1cclxuXHJcblx0c2V0U2NvcGVzKCkge1xyXG5cdFx0Y29uc3QgYm91bmRNZXRob2RzID0gW1xyXG5cdFx0XHQndG9nZ2xlUG93ZXInLFxyXG5cdFx0XHQndG9nZ2xlTW90b3InLFxyXG5cdFx0XHQnb25DbGlja0xvYWRUcmFjaycsXHJcblx0XHRcdCdvblNlbGVjdFRyYWNrJyxcclxuXHRcdFx0J29uU2V0Vm9sdW1lJyxcclxuXHRcdFx0J29uU2V0VGVtcG8nLFxyXG5cdFx0XHQnb25SZXZlcmJDaGFuZ2UnXHJcblx0XHRdO1xyXG5cclxuXHRcdGZvciAobGV0IG1ldGhvZCBvZiBib3VuZE1ldGhvZHMpIHtcclxuXHRcdFx0dGhpc1ttZXRob2RdID0gdGhpc1ttZXRob2RdLmJpbmQodGhpcyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGRzIG9yIHJlbW92ZXMgZXZlbnRMaXN0ZW5lcnMgZnJvbSB0aGUgRE9NIFVJIGVsZW1lbnRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2Jvb2x9IGVuYWJsZSBpZiB0cnVlLCBlbmFibGVzIHRoZSB1aSwgZWxzZSBkaXNhYmxlIHRoZW1cclxuXHQgKi9cclxuXHR0b2dnbGVVSShlbmFibGUgPSB0cnVlKSB7XHJcblx0XHRsZXQgZnVuYyA9IGVuYWJsZSA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcclxuXHJcblx0XHR0aGlzLmRvbS50b2dnbGVNb3RvcltmdW5jXSgnY2xpY2snLCB0aGlzLnRvZ2dsZU1vdG9yKTtcclxuXHRcdHRoaXMuZG9tLnRvZ2dsZVBvd2VyW2Z1bmNdKCdjbGljaycsIHRoaXMudG9nZ2xlUG93ZXIpO1xyXG5cdFx0dGhpcy5kb20uc2VsZWN0VHJhY2tbZnVuY10oJ2NoYW5nZScsIHRoaXMub25TZWxlY3RUcmFjayk7XHJcblx0XHR0aGlzLmRvbS5sb2FkVHJhY2tbZnVuY10oJ2NsaWNrJywgdGhpcy5vbkNsaWNrTG9hZFRyYWNrKTtcclxuXHRcdHRoaXMuZG9tLnZvbHVtZVtmdW5jXSgnaW5wdXQnLCB0aGlzLm9uU2V0Vm9sdW1lKTtcclxuXHRcdHRoaXMuZG9tLnNsaWRlclRlbXBvW2Z1bmNdKCdjaGFuZ2UnLCB0aGlzLm9uU2V0VGVtcG8pO1xyXG5cdFx0Ly8gZm9yLi4ub2YsIG5vdCBpbiBjaHJvbWVcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kb20ucmFkaW9zUmV2ZXJiLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGxldCByYWRpbyA9IHRoaXMuZG9tLnJhZGlvc1JldmVyYltpXTtcclxuXHJcblx0XHRcdHJhZGlvW2Z1bmNdKCdjaGFuZ2UnLCB0aGlzLm9uUmV2ZXJiQ2hhbmdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCByZWZlcmVuY2VzIHRvIERPTSBlbGVtZW50c1xyXG5cdCAqIFRPRE86IGFsbCBzZWxlY3RvcnMgb24gbmFtZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtub25lfVxyXG5cdCAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggbmFtZS1ET01FbGVtZW50IHBhaXJzXHJcblx0ICovXHJcblx0Z2V0RG9tRWxlbWVudHMoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR0b2dnbGVNb3RvcjogdGhpcy5nZXRFbCgnLmpzLXRvZ2dsZS1tb3RvcicpLFxyXG5cdFx0XHR0b2dnbGVQb3dlcjogdGhpcy5nZXRFbCgnLmpzLXRvZ2dsZS1wb3dlcicpLFxyXG5cdFx0XHRzZWxlY3RUcmFjazogdGhpcy5nZXRFbCgnLmpzLXRyYWNrLXNlbGVjdCcpLFxyXG5cdFx0XHRpbnB1dFRyYWNrOiB0aGlzLmdldEVsKCcuanMtdHJhY2staW5wdXQnKSxcclxuXHRcdFx0bG9hZFRyYWNrOiB0aGlzLmdldEVsKCcuanMtbG9hZC10cmFjaycpLFxyXG5cdFx0XHRzbGlkZXJUZW1wbzogbmV3IFNsaWRlcignLmpzLXNsaWRlci10ZW1wbycsIHsgbWluOiA4LCBtYXg6IC04IH0pLFxyXG5cdFx0XHR2b2x1bWU6IHRoaXMuZ2V0RWwoJy5qcy12b2x1bWUnKSxcclxuXHRcdFx0b3V0cHV0OiB0aGlzLmdldEVsKCcuanMtb3V0cHV0JyksXHJcblx0XHRcdHJhZGlvc1JldmVyYjogdGhpcy5nZXRFbCgnaW5wdXRbbmFtZT1cInJldmVyYlwiXScsIHRydWUpXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Z2V0RWwoc2VsZWN0b3IsIG11bHRpcGxlID0gZmFsc2UpIHtcclxuXHRcdGlmIChtdWx0aXBsZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZU91dHB1dCgpIHtcclxuXHRcdGxldCBzcGVlZCA9IHRoaXMudHJhY2tTcGVlZDtcclxuXHJcblx0XHR0aGlzLmRvbS5vdXRwdXQuaW5uZXJIVE1MID0gYFxyXG5cdFx0XHRcdGZwczogJHt0aGlzLmxhc3RGcHN9IDxiciAvPlxyXG5cdFx0XHRcdHNwZWVkOiAke3NwZWVkfXggPGJyIC8+XHJcblx0XHRcdFx0cHJvZ3Jlc3M6ICR7dGhpcy50cmFjay5wb3NpdGlvbn1zIDxiciAvPlxyXG5cdFx0XHRcdCR7dGhpcy50cmFjay5kdXJhdGlvbn1zIDxiciAvPlxyXG5cdFx0XHRcdCR7TWF0aC5yb3VuZCh0aGlzLnRyYWNrLnByb2dyZXNzKX0lYDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgY3VycmVudCB0cmFjayBzcGVlZFxyXG5cdCAqIERlcGVuZHMgb24gdXNlciBpcyBzY3JhdGNoaW5nXHJcblx0ICovXHJcblx0Z2V0IHRyYWNrU3BlZWQoKSB7XHJcblx0XHRsZXQgc3BlZWQ7XHJcblxyXG5cdFx0aWYgKHRoaXMudHJhY2suc2NyYXRjaGluZykge1xyXG5cdFx0XHRzcGVlZCA9IHRoaXMudHJhY2suc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNwZWVkID0gdGhpcy5kZWNrLm1vdG9yU3BlZWRGYWN0b3I7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMudHJhY2sucmV2ZXJzZWQpIHtcclxuXHRcdFx0c3BlZWQgKj0gLTE7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHNwZWVkO1xyXG5cdH1cclxuXHJcblx0Z2V0IGRlZmF1bHRUcmFja1N0YXRlKCkge1xyXG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIFRSQUNLX1NUQVRFKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgaW4gYSBgdmlzaWJpbGl0eWNoYW5nZWAgZXZlbnQgaGFuZGxlclxyXG5cdCAqIElmIG5vdCB2aXNpYmxlLCBgaXNBY3RpdmVgIGlzIGZhbHNlIGFuZCBwbGF5ZXIgcGF1c2VzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2Jvb2x9IGlzQWN0aXZlIHN0YXRlIG9mIHRoZSBjb250cm9sbGVyXHJcblx0ICogQHJldHVybiB7dm9pZH1cclxuXHQgKi9cclxuXHRzZXRJc0FjdGl2ZShpc0FjdGl2ZSkge1xyXG5cdFx0Ly8gbm90aGluZyB0byBtYW5hZ2VcclxuXHRcdGlmICghdGhpcy50cmFjay5zdGFydGVkIHx8ICF0aGlzLm1vdG9yUnVubmluZykge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGlzQWN0aXZlICYmIHRoaXMubW90b3JSdW5uaW5nKSB7XHJcblx0XHRcdHRoaXMucGxheSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy50cmFjay5zb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gMDtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbnRyb2xsZXI7XHJcbiIsImltcG9ydCB0aW1lQ29uZmlnIGZyb20gJy4vY29uZmlncy90aW1lcyc7XHJcblxyXG5jb25zdCBQSSA9IE1hdGguUEk7XHJcbmNvbnN0IFRPX0RFR1JFRSA9IDE4MCAvIFBJO1xyXG5jb25zdCBUT19SQURJQU4gPSBQSSAvIDE4MDtcclxuXHJcbi8vIGJyaW5nIGluIHRoZSBtYWdpYyBudW1iZXJzXHJcbmNvbnN0IEFSTV9NQVhfUk9UQVRJT04gPSA0NjtcclxuY29uc3QgQVJNX01JTl9ST1RBVElPTiA9IDI0O1xyXG5jb25zdCBBUk1fUk9UQVRJT04gPSBBUk1fTUFYX1JPVEFUSU9OIC0gQVJNX01JTl9ST1RBVElPTjtcclxuXHJcbmNsYXNzIERlY2sgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHsgc2VsZWN0b3I6ICcuanMtdHVybnRhYmxlJywgZHVyYXRpb246IDMwIH0pIHtcclxuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy5zZWxlY3Rvcik7XHJcblxyXG5cdFx0dGhpcy5kaXNjID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuanMtZGlzYycpO1xyXG5cdFx0dGhpcy5hcm0gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hcm0nKTtcclxuXHRcdHRoaXMubW90b3IgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tb3RvcicpO1xyXG5cclxuXHRcdHRoaXMuZWxSZWN0ID0gdGhpcy5kaXNjLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHRcdHRoaXMuaW5pdCgpO1xyXG5cdH1cclxuXHJcblx0aW5pdCgpIHtcclxuXHRcdHRoaXMubW91c2VEb3duID0gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy50b3VjaFN0YXJ0SGFuZGxlciA9IHRoaXMudG91Y2hTdGFydEhhbmRsZXIgfHwgdGhpcy5ub29wO1xyXG5cdFx0dGhpcy50b3VjaEVuZEhhbmRsZXIgPSB0aGlzLnRvdWNoRW5kSGFuZGxlciB8fCB0aGlzLm5vb3A7XHJcblx0XHR0aGlzLnRvdWNoTW92ZUhhbmRsZXIgPSB0aGlzLnRvdWNoTW92ZUhhbmRsZXIgfHwgdGhpcy5ub29wO1xyXG5cclxuXHRcdHRoaXMucmFkaWFuc0RpZmZIaXN0b3J5ID0gW107XHJcblx0XHR0aGlzLm1heEhpc3RvcnkgPSAzMDtcclxuXHJcblx0XHR0aGlzLmRpc2NSb3RhdGlvbiA9IDA7XHJcblxyXG5cdFx0dGhpcy5tb3RvclJ1bm5pbmcgPSBmYWxzZTtcclxuXHRcdHRoaXMubW90b3JSb3RhdGlvbiA9IDA7XHJcblx0XHR0aGlzLm1vdG9yTWF4U3BlZWQgPSB0aW1lQ29uZmlnLm1vdG9yTWF4OyAvLyBjYW4gYmUgYWx0ZWQgYnkgc2V0dGluZyB0ZW1wb1xyXG5cdFx0dGhpcy5tb3RvclNwZWVkID0gMDtcclxuXHRcdHRoaXMubW90b3JTbG9wZSA9IDA7XHJcblxyXG5cdFx0dGhpcy5yYWYgPSBudWxsO1xyXG5cclxuXHRcdHRoaXMucmFkaWFuc0RlZmF1bHQgPSB7XHJcblx0XHRcdGN1cnJlbnQ6IDAsIC8vIGN1cnJlbnQgcm90YXRpb24gKC1QSSAtIFBJKVxyXG5cdFx0XHRwcmV2aW91czogMCwgLy8gcHJldmlvdXMgcm90YXRpb24gKC1QSSAtIFBJKVxyXG5cdFx0XHRyb3RhdGVkOiAwLCAvLyB0b3RhbCByb3RhdGlvbiAoMCAtICopXHJcblx0XHRcdHJvdGF0ZWRQcmV2aW91czogMCwgLy8gcHJldmlvdXMgdG90YWwgcm90YXRpb24gKDAgLSAqKVxyXG5cdFx0XHRyb3RhdGVkRGlmZjogMCwgLy8gZGlmZmVyZW5jZSBpbiByb3RhdGlvblxyXG5cdFx0XHR0b3RhbDogMCxcclxuXHRcdFx0dG91Y2hTdGFydDogMCAvLyBhbmdsZSBvZiBwb2ludGVyXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMucmFkaWFucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucmFkaWFuc0RlZmF1bHQpO1xyXG5cclxuXHRcdHRoaXMubWlkWCA9IHRoaXMuZWxSZWN0LndpZHRoID4+IDE7XHJcblx0XHR0aGlzLm1pZFkgPSB0aGlzLmVsUmVjdC5oZWlnaHQgPj4gMTtcclxuXHJcblx0XHR0aGlzLmFkZEV2ZW50SGFuZGxlcnMoKTtcclxuXHR9XHJcblxyXG5cdG5vb3AoKSB7XHJcblx0XHQvLyBwbGFjZWhvbGRlclxyXG5cdH1cclxuXHJcblx0YWRkRXZlbnRIYW5kbGVycygpIHtcclxuXHRcdHRoaXMubW91c2VEb3duSGFuZGxlciA9IChlKSA9PiB7XHJcblx0XHRcdHRoaXMub25Nb3VzZURvd24oZSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMubW91c2VVcEhhbmRsZXIgPSAoZSkgPT4ge1xyXG5cdFx0XHR0aGlzLm9uTW91c2VVcChlKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5tb3VzZU1vdmVIYW5kbGVyID0gKGUpID0+IHtcclxuXHRcdFx0dGhpcy5vbk1vdXNlTW92ZShlKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5kaXNjLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMubW91c2VEb3duSGFuZGxlcik7XHJcblx0fVxyXG5cclxuXHJcblx0b25Nb3VzZURvd24oZSkge1xyXG5cdFx0bGV0IG1vdXNlUG9zaXRpb24gPSB0aGlzLmdldERpc2NNb3VzZVBvc2l0aW9uKGUpO1xyXG5cclxuXHRcdHRoaXMubW91c2VEb3duID0gdHJ1ZTtcclxuXHJcblx0XHR0aGlzLnJhZGlhbnMubW91c2UgPSBNYXRoLmF0YW4yKG1vdXNlUG9zaXRpb24ueSAtIHRoaXMubWlkWSwgbW91c2VQb3NpdGlvbi54IC0gdGhpcy5taWRYKTtcclxuXHJcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XHJcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcclxuXHJcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2lzLXNjcmF0Y2hpbmcnKTtcclxuXHJcblx0XHR0aGlzLnRvdWNoU3RhcnRIYW5kbGVyKCk7XHJcblx0fVxyXG5cclxuXHRvbk1vdXNlVXAoZSkge1xyXG5cdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZTtcclxuXHJcblx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XHJcblx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcclxuXHJcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNjcmF0Y2hpbmcnKTtcclxuXHJcblx0XHQvLyB1cGRhdGUgZGlzY1JvdGF0aW9uLCB1c2VkIGluIGBtb3Rvckxvb3AoKWBcclxuXHRcdHRoaXMuZGlzY1JvdGF0aW9uID0gdGhpcy5yYWRpYW5zLnJvdGF0ZWQgKiBUT19ERUdSRUU7XHJcblxyXG5cdFx0dGhpcy50b3VjaEVuZEhhbmRsZXIodGhpcy5wcm9ncmVzcyk7XHJcblx0fVxyXG5cclxuXHQvLyBodHRwOi8vZ2FtZWRldi5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvNDQ2Ny9jb21wYXJpbmctYW5nbGVzLWFuZC13b3JraW5nLW91dC10aGUtZGlmZmVyZW5jZVxyXG5cdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjUwMDQzMC9jYWxjdWxhdGluZy1yb3RhdGlvbi1pbi0zNjAtZGVnLXNpdHVhdGlvbnNcclxuXHRvbk1vdXNlTW92ZShlKSB7XHJcblx0XHRjb25zdCBtb3VzZVBvc2l0aW9uID0gdGhpcy5nZXREaXNjTW91c2VQb3NpdGlvbihlKTtcclxuXHRcdGNvbnN0IG1vdXNlQW5nbGUgPSBNYXRoLmF0YW4yKG1vdXNlUG9zaXRpb24ueSAtIHRoaXMubWlkWSwgbW91c2VQb3NpdGlvbi54IC0gdGhpcy5taWRYKTtcclxuXHJcblx0XHRjb25zdCBkaWZmQW5nbGUgPSB0aGlzLmdldEFuZ2xlRGlmZih0aGlzLnJhZGlhbnMubW91c2UsIG1vdXNlQW5nbGUpO1xyXG5cdFx0Y29uc3QgbmV3Um90YXRpb24gPSB0aGlzLnJhZGlhbnMucm90YXRlZCArIGRpZmZBbmdsZTtcclxuXHJcblx0XHRpZiAobmV3Um90YXRpb24gPD0gMCB8fCBuZXdSb3RhdGlvbiA+PSB0aGlzLnJhZGlhbnMudG90YWwpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMucmFkaWFucy5yb3RhdGVkID0gbmV3Um90YXRpb247XHJcblx0XHR0aGlzLnJhZGlhbnMubW91c2UgPSBtb3VzZUFuZ2xlO1xyXG5cclxuXHRcdHRoaXMucm90YXRlRGlzYyh0aGlzLnJhZGlhbnMucm90YXRlZCk7XHJcblx0XHRpZiAoIXRoaXMuaXNGYWxzZVBvc2l0aXZlKGRpZmZBbmdsZSkpIHtcclxuXHRcdFx0bGV0IHByb2dyZXNzID0gdGhpcy5wcm9ncmVzcztcclxuXHRcdFx0bGV0IGF2Z0RpZmYgPSB0aGlzLmdldEF2ZXJhZ2VEaWZmKGRpZmZBbmdsZSk7XHJcblxyXG5cdFx0XHR0aGlzLnJvdGF0ZUFybShwcm9ncmVzcyk7XHJcblx0XHRcdHRoaXMudG91Y2hNb3ZlSGFuZGxlcihhdmdEaWZmLCBwcm9ncmVzcyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBtb3VzZU1vdmUgaXMgdmVyeSBzZW5zaXRpdmUuIFdoZW4gc2NyYXRjaGluZyBmb3J3YXJkIGFuZCB0aGUgcG9pbnRlciBtb3ZlcyAxIHBpeGVsIGJhY2t3YXJkcyxcclxuXHQgKiB0aGUgc2NyaXB0IHRoaW5ncyB3ZSB3YW50IHRvIHJldmVyc2UuIFRvIHByZXZlbnQgdGhpcywgY2hlY2sgaWYgdGhlIGxhc3QgKHgpIHBpeGVscyB3ZXJlXHJcblx0ICogaW4gdGhlIHNhbWUgZGlyZWN0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGFuZ2xlQ2hhbmdlIHRoZSBjaGFuZ2UgaW4gYW5nbGUgZHVyaW5nIG1vdXNlTW92ZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0cmVzaG9sZCBtaW51bXVtIHJlcXVpcmVkIG51bWJlciBvZiBjaGFuZ2VzIGluIHRoZSBzYW1lIGRpcmVjdGlvblxyXG5cdCAqIEByZXR1cm4ge0Jvb2x9XHJcblx0ICovXHJcblx0aXNGYWxzZVBvc2l0aXZlKGFuZ2xlQ2hhbmdlLCB0cmVzaG9sZCA9IDUpIHtcclxuXHRcdHRoaXMucmFkaWFuc0RpZmZIaXN0b3J5LnVuc2hpZnQoYW5nbGVDaGFuZ2UpO1xyXG5cdFx0dGhpcy5yYWRpYW5zRGlmZkhpc3RvcnkgPSB0aGlzLnJhZGlhbnNEaWZmSGlzdG9yeS5zbGljZSgwLCB0aGlzLm1heEhpc3RvcnkpO1xyXG5cclxuXHRcdGlmICh0aGlzLnJhZGlhbnNEaWZmSGlzdG9yeS5sZW5ndGggPCB0aGlzLm1heEhpc3RvcnkpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBkaXJlY3Rpb25zID0gdGhpcy5yYWRpYW5zRGlmZkhpc3RvcnkuZmlsdGVyKChudW0pID0+IHtcclxuXHRcdFx0aWYgKGFuZ2xlQ2hhbmdlIDwgMCkge1xyXG5cdFx0XHRcdHJldHVybiBudW0gPCAwO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gbnVtID4gMDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBkaXJlY3Rpb25zLmxlbmd0aCA8IHRyZXNob2xkO1xyXG5cdH1cclxuXHJcblx0Z2V0QXZlcmFnZURpZmYoZGlmZikge1xyXG5cdFx0aWYgKHRoaXMucmFkaWFuc0RpZmZIaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gZGlmZjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBodHRwOi8vanNwZXJmLmNvbS9zcGVlZHktc3VtbWVyLXVwcGVyXHJcblx0XHQvLyBsZXQgc3VtID0gdGhpcy5yYWRpYW5zRGlmZkhpc3RvcnkucmVkdWNlKChhLCBiKSA9PiBhICsgYik7XHJcblxyXG5cdFx0Ly8gaW4gZmF2b3Igb2Ygc3BlZWRcclxuXHRcdGxldCBzdW0gPSAwO1xyXG5cdFx0bGV0IGxlbmd0aCA9IHRoaXMucmFkaWFuc0RpZmZIaXN0b3J5Lmxlbmd0aDtcclxuXHRcdGxldCBpO1xyXG5cclxuXHRcdGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG5cdFx0XHRzdW0gKz0gdGhpcy5yYWRpYW5zRGlmZkhpc3RvcnlbaV07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHN1bSAvIGxlbmd0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCByb3RhdGlvbiBvZiBkaXNjXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FuZ2xlfSBhbmdsZSB0byByb3RhdGUgdG8sIGluIHJhZGlhbnNcclxuXHQgKi9cclxuXHRyb3RhdGVEaXNjKGFuZ2xlKSB7XHJcblx0XHR0aGlzLmRpc2Muc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke2FuZ2xlICogVE9fREVHUkVFfWRlZylgO1xyXG5cdH1cclxuXHJcblx0cm90YXRlQXJtKHByb2dyZXNzKSB7XHJcblx0XHRsZXQgcm90YXRpb24gPSAoQVJNX1JPVEFUSU9OIC8gMTAwKSAqIHByb2dyZXNzO1xyXG5cdFx0bGV0IGFybVJvdGF0aW9uID0gQVJNX01JTl9ST1RBVElPTiArIHJvdGF0aW9uO1xyXG5cclxuXHRcdHRoaXMuYXJtLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHthcm1Sb3RhdGlvbn1kZWcpYDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHRvdGFsIHR1cm5zIHRoZSBkZWNrIGNhbiBtYWtlLCBkZXBlbmRpbmcgb24gdGhlIGR1cmF0aW9uXHJcblx0ICogVE9ETzogdXBkYXRlIGludGVydmFsIGluIGEgbG9vcDogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80Nzg3NDMxL2NoZWNrLWZwcy1pbi1qc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGR1cmF0aW9uIHRoZSBkdXJhdGlvbiBvZiB0aGUgdHJhY2sgaW4gc2Vjb25kc1xyXG5cdCAqL1xyXG5cdHNldER1cmF0aW9uKGR1cmF0aW9uKSB7XHJcblx0XHRsZXQgZnBzID0gNjA7XHJcblx0XHRsZXQgdG90YWxGcmFtZXMgPSBmcHMgKiBkdXJhdGlvbjtcclxuXHRcdGxldCB0b3RhbFJvdGF0aW9ucyA9IHRvdGFsRnJhbWVzICogdGltZUNvbmZpZy5tb3Rvck1heDtcclxuXHJcblx0XHR0aGlzLnJhZGlhbnMudG90YWwgPSB0b3RhbFJvdGF0aW9ucyAqIFRPX1JBRElBTjtcclxuXHR9XHJcblxyXG5cdHNldEltYWdlKGltYWdlVXJsKSB7XHJcblx0XHR0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1kaXNjLWltYWdlJykuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybCgke2ltYWdlVXJsfSlgO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogY2FsbGVkIGZyb20gY29udHJvbGxlci4gU2V0cyByb3RhdGlvbiBvZiB0aGUgZGlzY1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHByb2dyZXNzIG9mIHRyYWNrIHBsYXliYWNrIGluIHBlcmNlbnRcclxuXHQgKi9cclxuXHRzZXRQcm9ncmVzcyhwcm9ncmVzcykge1xyXG5cdFx0bGV0IHJvdGF0aW9uID0gKHRoaXMucmFkaWFucy50b3RhbCAvIDEwMCkgKiBwcm9ncmVzcztcclxuXHJcblx0XHR0aGlzLnJhZGlhbnMucm90YXRlZCA9IHJvdGF0aW9uO1xyXG5cdFx0dGhpcy5kaXNjUm90YXRpb24gPSByb3RhdGlvbiAqIFRPX0RFR1JFRTtcclxuXHJcblx0XHR0aGlzLnJvdGF0ZUFybShwcm9ncmVzcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbmNyZWFzZXMgb3IgZGVjcmVhc2VzIHRoZSBzcGVlZCBvZiB0aGUgbW90b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0ZW1wb0luY3JlYXNlIGEgcGVyY2VudHVhbCB2YWx1ZS4gQ2FuIGJlIG5lZ2F0aXZlIGFuZCBwb3NpdGl2ZTtcclxuXHQgKi9cclxuXHRzZXRUZW1wbyh0ZW1wb0luY3JlYXNlKSB7XHJcblx0XHR0aGlzLm1vdG9yTWF4U3BlZWQgPSB0aW1lQ29uZmlnLm1vdG9yTWF4ICsgKCh0aW1lQ29uZmlnLm1vdG9yTWF4ICogMC4wMSkgKiB0ZW1wb0luY3JlYXNlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRvZ2dsZSBzdGF0ZSBvZiB0aGUgbW90b3JcclxuXHQgKiBJZiBzd2l0Y2hlZCBvbiwgbW90b3JTcGVlZCBpbmNyZWFzZXMsIGVsc2UgaXQgZGVjcmVhc2VzXHJcblx0ICogSWYgdGhlIHBvd2VyZWQgaXMgc3dpdGNoZWQgb2YsIG1vdG9yU3BlZWQgZGVjcmVhc2VzIHNsb3dlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtCb29sfSBvbiBpZiBtb3RvciBpcyBzd2l0Y2hlZCBvbiAodHJ1ZSkgb3Igb2ZmIChmYWxzZSlcclxuXHQgKiBAcGFyYW0ge0Jvb2x9IHBvd2VyRG93biBpZiB0aGUgcG93ZXIgd2VudCBkb3duICh0cnVlKSBvciBub3QgKGZhbHNlKVxyXG5cdCAqL1xyXG5cdHRvZ2dsZU1vdG9yKG9uLCBwb3dlckRvd24gPSBmYWxzZSkge1xyXG5cdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yYWYpO1xyXG5cclxuXHRcdHRoaXMubW90b3JSdW5uaW5nID0gb247XHJcblxyXG5cdFx0aWYgKHBvd2VyRG93biA9PT0gdHJ1ZSkge1xyXG5cdFx0XHR0aGlzLm1vdG9yU2xvcGUgPSB0aW1lQ29uZmlnLnBvd2VyT2ZmO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5tb3RvclNsb3BlID0gb25cclxuXHRcdFx0XHQ/IHRpbWVDb25maWcubW90b3JPblxyXG5cdFx0XHRcdDogdGltZUNvbmZpZy5tb3Rvck9mZjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLm1vdG9yTG9vcCA9IHRoaXMubW90b3JMb29wLmJpbmQodGhpcyk7XHJcblx0XHR0aGlzLm1vdG9yTG9vcCgpO1xyXG5cdH1cclxuXHJcblx0bW90b3JMb29wKCkge1xyXG5cdFx0aWYgKHRoaXMubW90b3JTcGVlZCArIHRoaXMubW90b3JTbG9wZSA+PSAwIHx8XHJcblx0XHRcdHRoaXMubW90b3JTcGVlZCArIHRoaXMubW90b3JTbG9wZSA8PSB0aGlzLm1vdG9yTWF4U3BlZWQpIHtcclxuXHRcdFx0dGhpcy5tb3RvclNwZWVkICs9IHRoaXMubW90b3JTbG9wZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjbGFtcFxyXG5cdFx0dGhpcy5tb3RvclNwZWVkID0gTWF0aC5taW4oTWF0aC5tYXgodGhpcy5tb3RvclNwZWVkLCAwKSwgdGhpcy5tb3Rvck1heFNwZWVkKTtcclxuXHJcblx0XHR0aGlzLm1vdG9yUm90YXRpb24gKz0gdGhpcy5tb3RvclNwZWVkO1xyXG5cclxuXHRcdHRoaXMubW90b3Iuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMubW90b3JSb3RhdGlvbn1kZWcpYDtcclxuXHJcblx0XHRpZiAoIXRoaXMubW91c2VEb3duKSB7XHJcblx0XHRcdHRoaXMuZGlzY1JvdGF0aW9uICs9IHRoaXMubW90b3JTcGVlZDtcclxuXHRcdFx0dGhpcy5yYWRpYW5zLnJvdGF0ZWQgPSB0aGlzLmRpc2NSb3RhdGlvbiAqIFRPX1JBRElBTjtcclxuXHJcblx0XHRcdGlmICh0aGlzLnByb2dyZXNzIDwgMTAwKSB7XHJcblx0XHRcdFx0dGhpcy5yb3RhdGVEaXNjKHRoaXMucmFkaWFucy5yb3RhdGVkKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLm1vdG9yU3BlZWQgIT09IDApIHtcclxuXHRcdFx0dGhpcy5yYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5tb3Rvckxvb3ApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmVzZXQoKSB7XHJcblx0XHR0aGlzLnJhZGlhbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJhZGlhbnNEZWZhdWx0KTtcclxuXHJcblx0XHR0aGlzLnJvdGF0ZURpc2ModGhpcy5yYWRpYW5zLnJvdGF0ZWQpO1xyXG5cdFx0dGhpcy5yb3RhdGVBcm0oMCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIG5vcm1hbGl6ZWQgdmFsdWUgb2YgbW90b3JTcGVlZCAoMCAtIDEpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBub3JtYWxpemVkIG1vdG9yU3BlZWRcclxuXHQgKi9cclxuXHRnZXQgbW90b3JTcGVlZEZhY3RvcigpIHtcclxuXHRcdHJldHVybiB0aGlzLm1vdG9yU3BlZWQgLyB0aW1lQ29uZmlnLm1vdG9yTWF4O1xyXG5cdH1cclxuXHJcblx0Z2V0IHByb2dyZXNzKCkge1xyXG5cdFx0bGV0IHJvdGF0aW9uID0gdGhpcy5yYWRpYW5zLnJvdGF0ZWQ7XHJcblx0XHRsZXQgcHJvZ3Jlc3MgPSAocm90YXRpb24gLyB0aGlzLnJhZGlhbnMudG90YWwpICogMTAwO1xyXG5cclxuXHRcdHJldHVybiBwcm9ncmVzcztcclxuXHR9XHJcblxyXG5cdGdldEFuZ2xlRGlmZihhbmdsZVN0YXJ0LCBhbmdsZVRhcmdldCkge1xyXG5cdFx0cmV0dXJuIE1hdGguYXRhbjIoTWF0aC5zaW4oYW5nbGVUYXJnZXQgLSBhbmdsZVN0YXJ0KSwgTWF0aC5jb3MoYW5nbGVUYXJnZXQgLSBhbmdsZVN0YXJ0KSk7XHJcblx0fVxyXG5cclxuXHQvLyBUT0RPOlxyXG5cdC8vIGZpbmQgYSBiZXR0ZXIgc29sdXRpb24gZm9yIHRoaXNcclxuXHRnZXREaXNjTW91c2VQb3NpdGlvbihldnQpIHtcclxuXHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODM4OTE1Ni93aGF0LXN1YnN0aXR1dGUtc2hvdWxkLXdlLXVzZS1mb3ItbGF5ZXJ4LWxheWVyeS1zaW5jZS10aGV5LWFyZS1kZXByZWNhdGVkLWluLXdlYlxyXG5cdFx0bGV0IGVsID0gZXZ0LnRhcmdldDtcclxuXHRcdGxldCB4ID0gMDtcclxuXHRcdGxldCB5ID0gMDtcclxuXHJcblx0XHR3aGlsZSAoZWwgJiYgIWlzTmFOKGVsLm9mZnNldExlZnQpICYmICFpc05hTihlbC5vZmZzZXRUb3ApKSB7XHJcblx0XHRcdHggKz0gZWwub2Zmc2V0TGVmdCAtIGVsLnNjcm9sbExlZnQ7XHJcblx0XHRcdHkgKz0gZWwub2Zmc2V0VG9wIC0gZWwuc2Nyb2xsVG9wO1xyXG5cdFx0XHRlbCA9IGVsLm9mZnNldFBhcmVudDtcclxuXHRcdH1cclxuXHJcblx0XHR4ID0gZXZ0LmNsaWVudFggLSB4O1xyXG5cdFx0eSA9IGV2dC5jbGllbnRZIC0geTtcclxuXHJcblx0XHRyZXR1cm4geyB4LCB5IH07XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEZWNrO1xyXG4iLCJjb25zdCBOVU1fQkxPQ0tTID0gNTAwO1xyXG5cclxuY2xhc3MgRHJhd2VyIHtcclxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0geyBzZWxlY3RvcjogJy5qcy1kcmF3ZXInLCBidWZmZXI6IG51bGwgfSkge1xyXG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcclxuXHR9XHJcblxyXG5cdGluaXRpYWxpemUoKSB7XHJcblx0XHR0aGlzLnByb2dyZXNzID0gMDtcclxuXHRcdHRoaXMuaXNTZWVraW5nID0gZmFsc2U7XHJcblx0XHR0aGlzLnBvaW50ZXJYID0gMDtcclxuXHJcblx0XHR0aGlzLmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuZWwpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdEcmF3ZXI6IGVsZW1lbnQgbm90IGZvdW5kJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5jYW52YXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG5cdFx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFx0dGhpcy5wcm9ncmVzc0JhciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLmpzLWRyYXdlci1wcm9ncmVzcycpO1xyXG5cclxuXHRcdHRoaXMud2lkdGggPSB0aGlzLmVsLm9mZnNldFdpZHRoO1xyXG5cdFx0dGhpcy5oYWxmV2lkdGggPSB0aGlzLndpZHRoICogMC41O1xyXG5cdFx0dGhpcy5oZWlnaHQgPSAxMDA7XHJcblx0XHR0aGlzLmhhbGZIZWlnaHQgPSB0aGlzLmhlaWdodCAqIDAuNTtcclxuXHJcblx0XHR0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcblx0XHR0aGlzLnNlZWtTdGFydEhhbmRsZXIgPSB0aGlzLnNlZWtTdGFydEhhbmRsZXIgfHwgdGhpcy5ub29wO1xyXG5cdFx0dGhpcy5zZWVrRW5kSGFuZGxlciA9IHRoaXMuc2Vla0VuZEhhbmRsZXIgfHwgdGhpcy5ub29wO1xyXG5cdFx0dGhpcy5zZWVrSGFuZGxlciA9IHRoaXMuc2Vla0hhbmRsZXIgfHwgdGhpcy5ub29wO1xyXG5cclxuXHRcdHRoaXMuaW5pdEV2ZW50cygpO1xyXG5cdH1cclxuXHJcblx0bm9vcCgpIHtcclxuXHRcdC8vIGNvbW1lbnRcclxuXHR9XHJcblxyXG5cdGluaXRFdmVudHMoKSB7XHJcblx0XHR0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLm9uU3RhcnRTZWVrKGUpKTtcclxuXHRcdHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlKSA9PiB0aGlzLm9uRW5kU2VlayhlKSk7XHJcblx0XHR0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB0aGlzLm9uU2VlayhlKSk7XHJcblx0fVxyXG5cclxuXHRkcmF3KGJ1ZmZlcikge1xyXG5cdFx0bGV0IGNoYW5uZWwgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcblx0XHRsZXQgYmxvY2tTdGVwID0gTWF0aC5mbG9vcihjaGFubmVsLmxlbmd0aCAvIE5VTV9CTE9DS1MpO1xyXG5cdFx0bGV0IGJsb2NrV2lkdGggPSB0aGlzLndpZHRoIC8gTlVNX0JMT0NLUztcclxuXHRcdGxldCBuZWdWYWx1ZXMgPSBbXTtcclxuXHRcdGxldCBwb3NWYWx1ZXMgPSBbXTtcclxuXHRcdGxldCBtYXhWYWx1ZSA9IDA7XHJcblx0XHRsZXQgeCA9IDA7XHJcblx0XHRsZXQgaTtcclxuXHJcblx0XHR0aGlzLmNsZWFyKCk7XHJcblxyXG5cdFx0Ly8gbG9vcCAxIHRvIGNvbGxlY3QgdmFsdWVzIGFuZCBnZXQgbWF4VmFsdWUuLi5cclxuXHRcdC8vIGh0dHBzOi8vanNmaWRkbGUubmV0L3JmcmVxYmg5LzUvXHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgTlVNX0JMT0NLUzsgaSsrKSB7XHJcblx0XHRcdC8vIHZhbHVlOiBQQ00gd2l0aCBhIG5vbWluYWwgcmFuZ2UgYmV0d2VlbiAtMSBhbmQgKzFcclxuXHRcdFx0bGV0IHZhbHVlID0gTWF0aC5hYnMoY2hhbm5lbFtpICogYmxvY2tTdGVwXSk7XHJcblxyXG5cdFx0XHRpZiAodmFsdWUgPiBtYXhWYWx1ZSkge1xyXG5cdFx0XHRcdG1heFZhbHVlID0gdmFsdWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHBvc1ZhbHVlcy5wdXNoKHZhbHVlKTtcclxuXHRcdFx0bmVnVmFsdWVzLnB1c2goLXZhbHVlKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuXHRcdHRoaXMuY3R4Lm1vdmVUbygwLCB0aGlzLmhhbGZIZWlnaHQpO1xyXG5cclxuXHRcdC8vIGxvb3AgZm9yd2FyZHMsIGRyYXcgdXBwZXIgc2lkZVxyXG5cdFx0Zm9yIChpID0gMDsgaSA8IHBvc1ZhbHVlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR4ICs9IGJsb2NrV2lkdGg7XHJcblx0XHRcdGxldCB2YWx1ZSA9IHBvc1ZhbHVlc1tpXTtcclxuXHJcblx0XHRcdGxldCB2YWx1ZVBlcmNlbnRhZ2UgPSAodmFsdWUgLyBtYXhWYWx1ZSkgKiAxMDA7XHJcblx0XHRcdGxldCBiYXJIZWlnaHQgPSAodGhpcy5oYWxmSGVpZ2h0ICogMC4wMSkgKiB2YWx1ZVBlcmNlbnRhZ2U7XHJcblx0XHRcdGxldCB5ID0gdGhpcy5oYWxmSGVpZ2h0IC0gYmFySGVpZ2h0O1xyXG5cclxuXHRcdFx0dGhpcy5jdHgubGluZVRvKHgsIHkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGkgPSBwb3NWYWx1ZXMubGVuZ3RoO1xyXG5cclxuXHRcdC8vIGxvb3AgYmFja3dhcmRzLCBkcmF3IHVuZGVyIHNpZGUgKD8pXHJcblx0XHR3aGlsZSAoaS0tKSB7XHJcblx0XHRcdGxldCB2YWx1ZSA9IHBvc1ZhbHVlc1tpXTtcclxuXHJcblx0XHRcdGxldCB2YWx1ZVBlcmNlbnRhZ2UgPSAodmFsdWUgLyBtYXhWYWx1ZSkgKiAxMDA7XHJcblx0XHRcdGxldCBiYXJIZWlnaHQgPSAodGhpcy5oYWxmSGVpZ2h0ICogMC4wMSkgKiB2YWx1ZVBlcmNlbnRhZ2U7XHJcblx0XHRcdGxldCB5ID0gdGhpcy5oYWxmSGVpZ2h0ICsgYmFySGVpZ2h0O1xyXG5cclxuXHRcdFx0dGhpcy5jdHgubGluZVRvKHgsIHkpO1xyXG5cdFx0XHR4IC09IGJsb2NrV2lkdGg7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IG5lZ2F0aXZlID0gJ3JnYmEoMjIwLCAwLCAwLCAwLjUpJztcclxuXHRcdGxldCBwb3NpdGl2ZSA9ICdyZ2JhKDAsIDIwMCwgMCwgMSknO1xyXG5cclxuXHRcdGxldCBncmFkaWVudCA9IHRoaXMuY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KHRoaXMuaGFsZldpZHRoLCAwLCB0aGlzLmhhbGZXaWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuXHRcdC8vIEFkZCBjb2xvcnNcclxuXHRcdGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCBuZWdhdGl2ZSk7XHJcblx0XHRncmFkaWVudC5hZGRDb2xvclN0b3AoMC4yLCBuZWdhdGl2ZSk7XHJcblx0XHRncmFkaWVudC5hZGRDb2xvclN0b3AoMC41LCBwb3NpdGl2ZSk7XHJcblx0XHRncmFkaWVudC5hZGRDb2xvclN0b3AoMC44LCBuZWdhdGl2ZSk7XHJcblx0XHRncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgbmVnYXRpdmUpO1xyXG5cclxuXHRcdC8vIEZpbGwgd2l0aCBncmFkaWVudFxyXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XHJcblxyXG5cdFx0dGhpcy5jdHgubGluZVRvKDAsIHRoaXMuaGFsZkhlaWdodCk7XHJcblx0XHR0aGlzLmN0eC5maWxsKCk7XHJcblx0XHR0aGlzLmN0eC5jbG9zZVBhdGgoKTtcclxuXHR9XHJcblxyXG5cdGRyYXdWYWx1ZXModmFsdWVzQXJyYXksIG1heFZhbHVlKSB7XHJcblx0XHRsZXQgYmxvY2tXaWR0aCA9IHRoaXMud2lkdGggLyBOVU1fQkxPQ0tTO1xyXG5cdFx0bGV0IHggPSAwO1xyXG5cdFx0bGV0IGk7XHJcblxyXG5cdFx0Zm9yIChpID0gMDsgaSA8IHZhbHVlc0FycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGxldCB2YWx1ZSA9IHZhbHVlc0FycmF5W2ldO1xyXG5cclxuXHRcdFx0bGV0IHZhbHVlUGVyY2VudGFnZSA9ICh2YWx1ZSAvIG1heFZhbHVlKSAqIDEwMDtcclxuXHRcdFx0bGV0IGJhckhlaWdodCA9ICh0aGlzLmhhbGZIZWlnaHQgKiAwLjAxKSAqIHZhbHVlUGVyY2VudGFnZTtcclxuXHRcdFx0bGV0IHkgPSB0aGlzLmhhbGZIZWlnaHQgLSBiYXJIZWlnaHQ7XHJcblxyXG5cdFx0XHR0aGlzLmN0eC5saW5lVG8oeCwgeSk7XHJcblx0XHRcdHggKz0gYmxvY2tXaWR0aDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGdldEJhckNvbG9yKHBlcmNlbnRhZ2UpIHtcclxuXHRcdGNvbnN0IGdyZWVuID0gMTIwO1xyXG5cclxuXHRcdHBlcmNlbnRhZ2UgPSBNYXRoLmFicyhwZXJjZW50YWdlKTtcclxuXHJcblx0XHRsZXQgaHVlID0gZ3JlZW4gLSAoKGdyZWVuICogMC4wMSkgKiBwZXJjZW50YWdlKTtcclxuXHJcblx0XHRyZXR1cm4gYGhzbCgke2h1ZX0sIDEwMCUsIDQwJSlgO1xyXG5cdH1cclxuXHJcblx0Y2xlYXIoKSB7XHJcblx0XHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cdH1cclxuXHJcblx0b25TdGFydFNlZWsoZSkge1xyXG5cdFx0bGV0IGNsaWNrWCA9IGUub2Zmc2V0WDtcclxuXHRcdGxldCBwcm9ncmVzcyA9IChjbGlja1ggLyB0aGlzLndpZHRoKSAqIDEwMDtcclxuXHJcblx0XHR0aGlzLmlzU2Vla2luZyA9IHRydWU7XHJcblx0XHR0aGlzLnBvaW50ZXJYID0gY2xpY2tYO1xyXG5cclxuXHRcdHRoaXMuc2Vla1N0YXJ0SGFuZGxlcihwcm9ncmVzcyk7XHJcblx0fVxyXG5cclxuXHRvbkVuZFNlZWsoZSkge1xyXG5cdFx0dGhpcy5pc1NlZWtpbmcgPSBmYWxzZTtcclxuXHRcdHRoaXMuc2Vla0VuZEhhbmRsZXIoKTtcclxuXHR9XHJcblxyXG5cdG9uU2VlayhlKSB7XHJcblx0XHRsZXQgY2xpY2tYID0gZS5vZmZzZXRYO1xyXG5cdFx0bGV0IGRpZmYgPSBNYXRoLmFicyhjbGlja1ggLSB0aGlzLnBvaW50ZXJYKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuaXNTZWVraW5nIHx8IGRpZmYgPCAyMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHByb2dyZXNzID0gKGNsaWNrWCAvIHRoaXMud2lkdGgpICogMTAwO1xyXG5cdFx0bGV0IGRpZmZQcm9ncmVzcyA9IHByb2dyZXNzIC0gdGhpcy5wcm9ncmVzcztcclxuXHJcblx0XHR0aGlzLnBvaW50ZXJYID0gY2xpY2tYO1xyXG5cclxuXHRcdHRoaXMuc2Vla0hhbmRsZXIocHJvZ3Jlc3MsIGRpZmZQcm9ncmVzcyk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGUocHJvZ3Jlc3MpIHtcclxuXHRcdHRoaXMucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuXHRcdHRoaXMucHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc30lYDtcclxuXHR9XHJcblxyXG5cdHJlc2V0KCkge1xyXG5cdFx0dGhpcy51cGRhdGUoMCk7XHJcblx0XHR0aGlzLmNsZWFyKCk7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEcmF3ZXI7XHJcbiIsImltcG9ydCBDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcic7XHJcblxyXG5sZXQgY29udHJvbGxlcnMgPSB7fTtcclxuXHJcbmNvbnRyb2xsZXJzLmxlZnQgPSBuZXcgQ29udHJvbGxlcignLmpzLWNvbnRyb2xsZXItbGVmdCcpO1xyXG53aW5kb3cuY29udHJvbGxlcnMgPSBjb250cm9sbGVycztcclxuXHJcbmZ1bmN0aW9uIG9uVmlzaWJpbGl0eUNoYW5nZShlKSB7XHJcblx0bGV0IGlzQWN0aXZlID0gIWRvY3VtZW50LmhpZGRlbjtcclxuXHJcblx0Zm9yIChsZXQgY29udHJvbGxlck5hbWUgb2YgT2JqZWN0LmtleXMoY29udHJvbGxlcnMpKSB7XHJcblx0XHRjb250cm9sbGVyc1tjb250cm9sbGVyTmFtZV0uc2V0SXNBY3RpdmUoaXNBY3RpdmUpO1xyXG5cdH1cclxufVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIG9uVmlzaWJpbGl0eUNoYW5nZSk7XHJcblxyXG5cclxuY29uc3QgQ1RSTCA9IDE3O1xyXG5cclxuZnVuY3Rpb24gb25LZXlEb3duKGUpIHtcclxuXHRpZiAoZS53aGljaCA9PT0gQ1RSTCkge1xyXG5cdFx0Y29udHJvbGxlcnMubGVmdC5tdXRlKCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gb25LZXlVcChlKSB7XHJcblx0aWYgKGUud2hpY2ggPT09IENUUkwpIHtcclxuXHRcdGNvbnRyb2xsZXJzLmxlZnQubXV0ZShmYWxzZSk7XHJcblx0fVxyXG59XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlEb3duKTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBvbktleVVwKTtcclxuXHJcblxyXG5cclxuLy8gU0tJTiBTSElaWkxFXHJcbmxldCBzdHlsZXNoZWV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NraW4nKTtcclxubGV0IHN0eWxlU2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1za2luXScpO1xyXG5cclxuZnVuY3Rpb24gc2V0U2tpbihza2luKSB7XHJcblx0bGV0IHBhcnRzID0gc3R5bGVzaGVldC5ocmVmLnNwbGl0KCcvJyk7XHJcblxyXG5cdHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdID0gYCR7c2tpbn0uY3NzYDtcclxuXHJcblx0c3R5bGVzaGVldC5ocmVmID0gcGFydHMuam9pbignLycpO1xyXG5cclxuXHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2tpbicsIHNraW4pO1xyXG59XHJcblxyXG5zdHlsZVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XHJcblx0bGV0IHNraW4gPSBlLnRhcmdldC52YWx1ZTtcclxuXHJcblx0c2V0U2tpbihza2luKTtcclxufSk7XHJcblxyXG5pZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NraW4nKSkge1xyXG5cdGxldCBza2luID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NraW4nKTtcclxuXHJcblx0c3R5bGVTZWxlY3Rvci52YWx1ZSA9IHNraW47XHJcblx0c2V0U2tpbihza2luKTtcclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlcyBhIHNsaWRlciAoZHVoKVxyXG4gKlxyXG4gKiBSZXR1cm5zIHRoZSBET01Ob2RlIHdpdGggd2hpY2ggdGhlIHNsaWRlciB3YXMgY3JlYXRlZFxyXG4gKi9cclxuY2xhc3MgU2xpZGVyIHtcclxuXHRjb25zdHJ1Y3RvcihzZWxlY3RvciwgdmFsdWVzID0geyBtaW46IDAsIG1heDogMSB9KSB7XHJcblx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlcztcclxuXHJcblx0XHR0aGlzLnNsaWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG5cdFx0dGhpcy5oYW5kbGUgPSB0aGlzLnNsaWRlci5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlJyk7XHJcblxyXG5cdFx0dGhpcy5zbGlkZXJSZWN0ID0gdGhpcy5zbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHR0aGlzLmhhbmRsZVJlY3QgPSB0aGlzLmhhbmRsZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcblx0XHR0aGlzLnNsaWRlcldpZHRoID0gdGhpcy5zbGlkZXJSZWN0LndpZHRoO1xyXG5cdFx0dGhpcy5zbGlkZXJIZWlnaHQgPSB0aGlzLnNsaWRlclJlY3QuaGVpZ2h0O1xyXG5cdFx0dGhpcy5oYW5kbGVIYWxmV2lkdGggPSB0aGlzLmhhbmRsZVJlY3Qud2lkdGggKiAwLjU7XHJcblx0XHR0aGlzLmhhbmRsZUhhbGZIZWlnaHQgPSB0aGlzLmhhbmRsZVJlY3QuaGVpZ2h0ICogMC41O1xyXG5cclxuXHRcdHRoaXMuZGlyZWN0aW9uID0gdGhpcy5zbGlkZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWhvcml6b250YWwnKSA/ICdoJyA6ICd2JztcclxuXHJcblx0XHRpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdoJykge1xyXG5cdFx0XHR0aGlzLnN0eWxlUHJvcCA9ICdsZWZ0JztcclxuXHRcdFx0dGhpcy5vZmZzZXQgPSB0aGlzLnNsaWRlclJlY3QubGVmdDtcclxuXHRcdFx0dGhpcy5jdXJyZW50UG9zID0gdGhpcy5zbGlkZXJSZWN0LndpZHRoICogMC41O1xyXG5cdFx0XHR0aGlzLm1pblZhbHVlID0gMDtcclxuXHRcdFx0dGhpcy5tYXhWYWx1ZSA9IHRoaXMuc2xpZGVyV2lkdGg7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnN0eWxlUHJvcCA9ICd0b3AnO1xyXG5cdFx0XHR0aGlzLm9mZnNldCA9IHRoaXMuc2xpZGVyUmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWTtcclxuXHRcdFx0dGhpcy5jdXJyZW50UG9zID0gdGhpcy5zbGlkZXJSZWN0LmhlaWdodCAqIDAuNTtcclxuXHRcdFx0dGhpcy5taW5WYWx1ZSA9IHRoaXMuaGFuZGxlSGFsZkhlaWdodDtcclxuXHRcdFx0dGhpcy5tYXhWYWx1ZSA9IHRoaXMuc2xpZGVySGVpZ2h0IC0gKHRoaXMuaGFuZGxlUmVjdC5oZWlnaHQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuc2xpZGVFdmVudCA9IG5ldyBFdmVudCgnY2hhbmdlJyk7XHJcblxyXG5cdFx0dGhpcy5zZXRTY29wZXMoKTtcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuXHRcdHRoaXMudXBkYXRlUG9zaXRpb24oKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5zbGlkZXI7XHJcblx0fVxyXG5cclxuXHRzZXRTY29wZXMoKSB7XHJcblx0XHRsZXQgbWV0aG9kcyA9IFtcclxuXHRcdFx0J2hhbmRsZUNsaWNrJyxcclxuXHRcdFx0J2hhbmRsZVJlbGVhc2UnLFxyXG5cdFx0XHQnc2xpZGVyTW91c2VPdmVyJyxcclxuXHRcdFx0J3NsaWRlck1vdXNlT3V0JyxcclxuXHRcdFx0J3NsaWRlck1vdXNlV2hlZWwnLFxyXG5cdFx0XHQnc2xpZGVyTW91c2VDbGljaycsXHJcblx0XHRcdCdoYW5kbGVNb3ZlJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRmb3IgKGxldCBtZXRob2Qgb2YgbWV0aG9kcykge1xyXG5cdFx0XHR0aGlzW21ldGhvZF0gPSB0aGlzW21ldGhvZF0uYmluZCh0aGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFkZEV2ZW50TGlzdGVuZXJzKCkge1xyXG5cdFx0dGhpcy5oYW5kbGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVDbGljayk7XHJcblx0XHR0aGlzLnNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLnNsaWRlck1vdXNlT3Zlcik7XHJcblx0XHR0aGlzLnNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMuc2xpZGVyTW91c2VPdXQpO1xyXG5cdFx0dGhpcy5zbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnNsaWRlck1vdXNlQ2xpY2spO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlUG9zaXRpb24oKSB7XHJcblx0XHQvLyBjbGFtcFxyXG5cdFx0dGhpcy5jdXJyZW50UG9zID0gTWF0aC5taW4oXHJcblx0XHRcdE1hdGgubWF4KHRoaXMuY3VycmVudFBvcywgdGhpcy5taW5WYWx1ZSksXHJcblx0XHRcdHRoaXMubWF4VmFsdWUgKyB0aGlzLm1pblZhbHVlXHJcblx0XHQpO1xyXG5cclxuXHRcdHRoaXMuaGFuZGxlLnN0eWxlW3RoaXMuc3R5bGVQcm9wXSA9IGAke3RoaXMuY3VycmVudFBvc31weGA7XHJcblxyXG5cdFx0dGhpcy5kaXNwYXRjaENoYW5nZUV2ZW50KCk7XHJcblx0fVxyXG5cclxuXHRkaXNwYXRjaENoYW5nZUV2ZW50KCkge1xyXG5cdFx0bGV0IHBlcmNlbnQgPSAoKHRoaXMuY3VycmVudFBvcyAtIHRoaXMubWluVmFsdWUpIC8gdGhpcy5tYXhWYWx1ZSkgKiAxMDA7XHJcblxyXG5cdFx0aWYgKHRoaXMuZGlyZWN0aW9uID09PSAndicpIHtcclxuXHRcdFx0cGVyY2VudCA9IDEwMCAtIHBlcmNlbnQ7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHZhbHVlc0RpZmYgPSB0aGlzLnZhbHVlcy5tYXggLSB0aGlzLnZhbHVlcy5taW47XHJcblx0XHRsZXQgdmFsdWUgPSAoKHZhbHVlc0RpZmYgKiAwLjAxKSAqIHBlcmNlbnQpICsgdGhpcy52YWx1ZXMubWluO1xyXG5cclxuXHRcdHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZS50b0ZpeGVkKDIpKTtcclxuXHRcdHBlcmNlbnQgPSBwYXJzZUZsb2F0KHBlcmNlbnQudG9GaXhlZCgyKSk7XHJcblxyXG5cdFx0dGhpcy5zbGlkZUV2ZW50LmRldGFpbCA9IHsgcGVyY2VudCwgdmFsdWUgfTtcclxuXHRcdHRoaXMuc2xpZGVyLmRpc3BhdGNoRXZlbnQodGhpcy5zbGlkZUV2ZW50KTtcclxuXHR9XHJcblxyXG5cdHNsaWRlck1vdXNlV2hlZWwoZSkge1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdGxldCBzcGVlZCA9IHRoaXMuZGlyZWN0aW9uID09PSAnaCcgPyAtNSA6IDU7XHJcblxyXG5cdFx0aWYgKGUuZGVsdGFZIDwgMCkge1xyXG5cdFx0XHRzcGVlZCA9IC1zcGVlZDtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmN1cnJlbnRQb3MgKz0gc3BlZWQ7XHJcblxyXG5cdFx0dGhpcy51cGRhdGVQb3NpdGlvbigpO1xyXG5cdH1cclxuXHJcblx0c2xpZGVyTW91c2VPdmVyKCkge1xyXG5cdFx0dGhpcy5zbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHRoaXMuc2xpZGVyTW91c2VXaGVlbCk7XHJcblx0fVxyXG5cclxuXHRzbGlkZXJNb3VzZU91dCgpIHtcclxuXHRcdHRoaXMuc2xpZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLnNsaWRlck1vdXNlV2hlZWwpO1xyXG5cdH1cclxuXHJcblx0c2xpZGVyTW91c2VDbGljayhlKSB7XHJcblx0XHRsZXQgY2xpY2tPZmZzZXQ7XHJcblxyXG5cdFx0aWYgKHRoaXMuZGlyZWN0aW9uID09PSAnaCcpIHtcclxuXHRcdFx0Y2xpY2tPZmZzZXQgPSBlLnBhZ2VYIC0gdGhpcy5vZmZzZXQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjbGlja09mZnNldCA9IGUucGFnZVkgLSB0aGlzLm9mZnNldCAtICh0aGlzLmhhbmRsZUhhbGZIZWlnaHQgKiAwLjUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuY3VycmVudFBvcyA9IGNsaWNrT2Zmc2V0O1xyXG5cdFx0dGhpcy51cGRhdGVQb3NpdGlvbigpO1xyXG5cdH1cclxuXHJcblx0aGFuZGxlTW92ZShlKSB7XHJcblx0XHRsZXQgbmV3T2Zmc2V0O1xyXG5cclxuXHRcdGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2gnKSB7XHJcblx0XHRcdG5ld09mZnNldCA9IGUucGFnZVggLSB0aGlzLmhhbmRsZUhhbGZIZWlnaHQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRuZXdPZmZzZXQgPSBlLnBhZ2VZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuY3VycmVudFBvcyA9IG5ld09mZnNldCAtIHRoaXMub2Zmc2V0O1xyXG5cdFx0dGhpcy51cGRhdGVQb3NpdGlvbigpO1xyXG5cdH1cclxuXHJcblx0aGFuZGxlQ2xpY2soZSkge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVNb3ZlKTtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmhhbmRsZVJlbGVhc2UpO1xyXG5cdH1cclxuXHJcblx0aGFuZGxlUmVsZWFzZSgpIHtcclxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuaGFuZGxlTW92ZSk7XHJcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVSZWxlYXNlKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNsaWRlcjtcclxuIiwiaW1wb3J0IHRpbWVDb25maWdzIGZyb20gJy4uL2NvbmZpZ3MvdGltZXMnO1xyXG5cclxuLy8gdGhlIG1heCBkdXJhdGlvbiBvZiBhIHRhcGUgaW4gTVNcclxuY29uc3QgU0FNUExFX0RVUkFUSU9OID0gdGltZUNvbmZpZ3Muc2FtcGxlVGltZTtcclxuXHJcbmNsYXNzIFNhbXBsZUNyZWF0b3IgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIHBvc3NpYmx5IG11dGlwbGUgdGFwZXMgZnJvbSAxIGJ1ZmZlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBdWRpb0NvbnRleHR9IGN0eCBBbiBBdWRpb0NvbnRleHQgaW5zdGFuY2VcclxuXHQgKiBAcGFyYW0ge0F1ZGlvQnVmZmVyfSBidWZmZXIgVGhlIGF1ZGlvQnVmZmVyIHRvIGNyZWF0ZSBzb3VyY2VzIGZyb21cclxuXHQgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9BdWRpb0J1ZmZlclxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGN0eCwgYnVmZmVyKSB7XHJcblx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHRcdHRoaXMuYnVmZmVyID0gYnVmZmVyO1xyXG5cclxuXHRcdHRoaXMuYnVmZmVyUmV2ZXJzZWQgPSB0aGlzLmN0eC5jcmVhdGVCdWZmZXIoMSwgdGhpcy5idWZmZXIubGVuZ3RoLCB0aGlzLmJ1ZmZlci5zYW1wbGVSYXRlKTtcclxuXHRcdHRoaXMuYnVmZmVyUmV2ZXJzZWQuZ2V0Q2hhbm5lbERhdGEoMCkuc2V0KHRoaXMuYnVmZmVyLmdldENoYW5uZWxEYXRhKDApLnNsaWNlKCkucmV2ZXJzZSgpKTtcclxuXHJcblx0XHR0aGlzLmR1cmF0aW9uVG90YWwgPSBidWZmZXIuZHVyYXRpb247XHJcblxyXG5cdFx0dGhpcy5zb3VyY2UgPSBudWxsO1xyXG5cdFx0dGhpcy5kdXJhdGlvbiA9IDA7XHJcblx0XHR0aGlzLm9mZnNldCA9IDA7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSB0YXBlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2ludH0gc3RhcnRUaW1lIHRoZSBzdGFydCB0aW1lIG9mIHRoZSB0YXBlIGluIE1TXHJcblx0ICogQHBhcmFtIHtib29sfSByZXZlcnNlZCBpZiB0aGUgdGFwZSBzaG91bGQgcGxheSBpbiByZXZlcnNlXHJcblx0ICogQHJldHVybiB7QXVkaW9CdWZmZXJTb3VyY2VOb2RlfSB0YXBlIHRoZSBzb3VyY2UgdG8gcGxheVxyXG5cdCAqL1xyXG5cdGNyZWF0ZShzdGFydFRpbWUgPSAwLCByZXZlcnNlZCA9IGZhbHNlLCBzYW1wbGVEdXJhdGlvbiA9IFNBTVBMRV9EVVJBVElPTikge1xyXG5cdFx0aWYgKHN0YXJ0VGltZSA+IHRoaXMuZHVyYXRpb25Ub3RhbCB8fCBzdGFydFRpbWUgPCAwKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihgZ2V0VGFwZTogc3RhcnRUaW1lIGNhbid0IGJlIGhpZ2hlciB0aGFuIGR1cmF0aW9uIG9yIGxvd2VyIHRoYW4gMCAoJHtzdGFydFRpbWV9LCAke3RoaXMuZHVyYXRpb25Ub3RhbH0pYCk7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHRvdGFsRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcclxuXHRcdGxldCBzYW1wbGVSYXRlID0gdGhpcy5jdHguc2FtcGxlUmF0ZTtcclxuXHJcblx0XHRsZXQgc3RhcnRUaW1lU2VjID0gc3RhcnRUaW1lO1xyXG5cdFx0bGV0IGR1cmF0aW9uU2VjID0gc2FtcGxlRHVyYXRpb247XHJcblxyXG5cdFx0Ly8gKy0gMk1TIGZhc3RlciB0aGFuIGBNYXRoLm1pbmBcclxuXHRcdGlmIChzdGFydFRpbWVTZWMgKyBkdXJhdGlvblNlYyA+IHRvdGFsRHVyYXRpb24pIHtcclxuXHRcdFx0ZHVyYXRpb25TZWMgPSB0b3RhbER1cmF0aW9uIC0gc3RhcnRUaW1lU2VjO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBkdXJhdGlvbiA9IGR1cmF0aW9uU2VjICogc2FtcGxlUmF0ZTtcclxuXHRcdGxldCBzb3VyY2VCdWZmZXI7XHJcblx0XHRsZXQgb2Zmc2V0O1xyXG5cclxuXHRcdGlmIChyZXZlcnNlZCkge1xyXG5cdFx0XHRvZmZzZXQgPSB0aGlzLmR1cmF0aW9uVG90YWwgLSBzdGFydFRpbWVTZWM7XHJcblx0XHRcdHNvdXJjZUJ1ZmZlciA9IHRoaXMuYnVmZmVyUmV2ZXJzZWQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvZmZzZXQgPSBzdGFydFRpbWVTZWM7XHJcblx0XHRcdHNvdXJjZUJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xyXG5cdFx0fVxyXG5cclxuXHRcdG9mZnNldCAqPSBzYW1wbGVSYXRlO1xyXG5cclxuXHRcdGxldCBsZW5ndGggPSBvZmZzZXQgKyBkdXJhdGlvbiAtIDE7XHJcblx0XHRsZXQgdGFwZUJ1ZmZlciA9IHRoaXMuY3R4LmNyZWF0ZUJ1ZmZlcigxLCBkdXJhdGlvbiwgdGhpcy5jdHguc2FtcGxlUmF0ZSk7XHJcblx0XHRsZXQgYnVmZmVyQXJyYXkgPSBzb3VyY2VCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCkuc2xpY2Uob2Zmc2V0LCBsZW5ndGgpO1xyXG5cclxuXHRcdHRhcGVCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCkuc2V0KGJ1ZmZlckFycmF5KTtcclxuXHJcblx0XHR0aGlzLnNvdXJjZSA9IHRoaXMuY3JlYXRlU291cmNlKHRhcGVCdWZmZXIpO1xyXG5cdFx0dGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uIC8gdGhpcy5jdHguc2FtcGxlUmF0ZTtcclxuXHJcblx0XHR0aGlzLm9mZnNldCA9IHN0YXJ0VGltZTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5zb3VyY2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBgQXVkaW9CdWZmZXJTb3VyY2VOb2RlYCBmcm9tIHRoZSBwcm92aWRlZCBidWZmZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7QXVkaW9CdWZmZXJ9IGJ1ZmZlciB0aGUgYnVmZmVyIHRvIGNyZWF0ZSB0byBzb3VyY2Ugbm9kZSB3aXRoXHJcblx0ICogQHJldHVybiB7QXVkaW9CdWZmZXJTb3VyY2VOb2RlfSB0aGUgY3JlYXRlZCBzb3VyY2VOb2RlXHJcblx0ICovXHJcblx0Y3JlYXRlU291cmNlKGJ1ZmZlcikge1xyXG5cdFx0bGV0IHNvdXJjZSA9IHRoaXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG5cclxuXHRcdHNvdXJjZS5idWZmZXIgPSBidWZmZXI7XHJcblx0XHRzb3VyY2UubG9vcCA9IGZhbHNlO1xyXG5cclxuXHRcdHJldHVybiBzb3VyY2U7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTYW1wbGVDcmVhdG9yO1xyXG4iLCJcclxuXHJcbmNsYXNzIEJ1ZmZlckxvYWRlciB7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtBdWRpb0NvbnRleHR9IGN0eCBhbiBvcHRpb25hbCBhdWRpb2NvbnRleHRcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihjdHggPSBuZXcgQXVkaW9Db250ZXh0KCkpIHtcclxuXHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cclxuXHRcdHRoaXMucmVxdWVzdCA9IG51bGw7XHJcblx0fVxyXG5cclxuXHRub29wKCkge1xyXG5cdFx0Ly8gcGxhY2Vob2xkZXJcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgYW4gVVJMIGludG8gYSBidWZmZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgYXVkaW8gZmlsZSB0byBsb2FkXHJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgcmVzb2x2ZSBmdW5jdGlvblxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBzY29wZSBzY29wZSB0byBiaW5kIGNhbGxiYWNrIHRvXHJcblx0ICogQHJldHVybiB7WE1MSHR0cFJlcXVlc3R9IHJlcXVlc3QgdGhlIGN1cnJlbnQgcmVxdWVzdCB1c2VkXHJcblx0ICovXHJcblx0bG9hZChvcHRpb25zID0ge30pIHtcclxuXHRcdGxldCB1cmwgPSBvcHRpb25zLnVybDtcclxuXHRcdGxldCBzY29wZSA9IG9wdGlvbnMuc2NvcGUgfHwgdGhpcztcclxuXHJcblx0XHR0aGlzLnByb2dyZXNzQ2FsbGJhY2sgPSAob3B0aW9ucy5wcm9ncmVzc0NhbGxiYWNrIHx8IHRoaXMubm9vcCkuYmluZChzY29wZSk7XHJcblx0XHR0aGlzLnN1Y2Nlc0NhbGxiYWNrID0gKG9wdGlvbnMuc3VjY2VzQ2FsbGJhY2sgfHwgdGhpcy5ub29wKS5iaW5kKHNjb3BlKTtcclxuXHJcblx0XHR0aGlzLnJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHJcblx0XHR0aGlzLnJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcclxuXHRcdHRoaXMucmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKGB0aGlzLnJlcXVlc3Qub3BlbiAke3VybH1gKTtcclxuXHJcblx0XHR0aGlzLnJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCB0aGlzLm9uUmVxdWVzdFByb2dyZXNzLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5yZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLm9uUmVxdWVzdExvYWRlZC5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHR0aGlzLnJlcXVlc3Quc2VuZCgpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnJlcXVlc3Q7XHJcblx0fVxyXG5cclxuXHRvblJlcXVlc3RQcm9ncmVzcyhlKSB7XHJcblx0XHRpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XHJcblx0XHRcdGxldCB0b3RhbCA9IGUudG90YWw7XHJcblx0XHRcdGxldCBsb2FkZWQgPSBlLmxvYWRlZDtcclxuXHRcdFx0bGV0IHBlcmNlbnQgPSAoKGxvYWRlZCAvIHRvdGFsKSAqIDEwMCkudG9GaXhlZCgyKTtcclxuXHJcblx0XHRcdHRoaXMucHJvZ3Jlc3NDYWxsYmFjayhwZXJjZW50KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMucHJvZ3Jlc3NDYWxsYmFjaygnbG9hZGluZy4uLicpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0b25SZXF1ZXN0TG9hZGVkKGUpIHtcclxuXHRcdGxldCByZXNwb25zZSA9IGUudGFyZ2V0LnJlc3BvbnNlO1xyXG5cclxuXHRcdHRoaXMuZGVjb2RlQXVkaW9EYXRhKHJlc3BvbnNlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlY29kZSBhcnJheUJ1ZmZlclxyXG5cdCAqXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0xvYWRFdmVudH0gbG9hZCBldmVudCBhcyByZXN1bHQgb2YgWE1MSHR0cFJlcXVlc3RcclxuXHQgKi9cclxuXHRkZWNvZGVBdWRpb0RhdGEocmVzcG9uc2UpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdkZWNvZGluZy4uLicpO1xyXG5cdFx0dGhpcy5jdHguZGVjb2RlQXVkaW9EYXRhKHJlc3BvbnNlKVxyXG5cdFx0XHQudGhlbih0aGlzLnN1Y2Nlc0NhbGxiYWNrLCAoKSA9PiB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdlcnJvciBpbiBkZWNvZGluZyBhdWRpbycpO1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJ1ZmZlckxvYWRlcjtcclxuIiwiLyoqXHJcbiAqIEZQUyBNZXRlclxyXG4gKiBSaXBwZWQgZnJvbTpcclxuICogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80Nzg3NDMxL2NoZWNrLWZwcy1pbi1qc1xyXG4gKi9cclxuXHJcbmNsYXNzIEZQU01ldGVyIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZmlsdGVyU3RyZW5ndGggPSAxIC8gMTA7XHJcblx0XHR0aGlzLmZyYW1lVGltZSA9IDA7XHJcblx0XHR0aGlzLmxhc3RUaW1lID0gbmV3IERhdGUoKTsgLy8gcGVyZm9ybWFuY2Uubm93KCk7XHJcblxyXG5cdFx0dGhpcy5fZnBzID0gMDtcclxuXHR9XHJcblxyXG5cdGdldCBmcHMoKSB7XHJcblx0XHQvLyBsZXQgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcblxyXG5cdFx0Ly8gdGhpcy5fZnBzID0gMTAwMCAvIChub3cgLSB0aGlzLmxhc3RUaW1lKTtcclxuXHJcblx0XHQvLyB0aGlzLmxhc3RUaW1lID0gbm93O1xyXG5cclxuXHRcdC8vIHJldHVybiB0aGlzLl9mcHM7XHJcblxyXG5cdFx0bGV0IG5vdyA9IG5ldyBEYXRlKCk7XHJcblx0XHRsZXQgZGVsYXkgPSBub3cgLSB0aGlzLmxhc3RUaW1lO1xyXG5cdFx0dGhpcy5fZnBzICs9IChkZWxheSAtIHRoaXMuX2ZwcykgLyAxMDtcclxuXHRcdHRoaXMubGFzdFRpbWUgPSBub3c7XHJcblxyXG5cdFx0cmV0dXJuIDEwMDAgLyB0aGlzLl9mcHM7XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBmcHNNZXRlciA9IG5ldyBGUFNNZXRlcigpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnBzTWV0ZXI7XHJcbiJdfQ==
