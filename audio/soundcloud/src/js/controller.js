/**
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
import timeConfigs from './configs/times';
import SampleCreator from './utils/SampleCreator';
import fpsMeter from './utils/fpsmeter';
import BufferLoader from './utils/bufferLoader';
import Slider from './ui/slider';
import Deck from './deck';
import Drawer from './drawer';

// some constants
const SC_CLIENT_ID = '2c6869e4a458d26865a2a11040c5a623';

// default state of track
const TRACK_STATE = {
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

class Controller {
	constructor(selector) {
		// references DOM elements
		this.el = document.querySelector(selector);

		this.dom = this.getDomElements();

		// audioContext and volume controller
		this.audioCtx = new AudioContext();
		this.gainNode = this.audioCtx.createGain();
		this.convolver = this.audioCtx.createConvolver();

		// buffer loader to load and decode audio files
		this.bufferLoader = new BufferLoader(this.audioCtx);

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
		this.deck = new Deck({
			selector: '.js-turntable',
			touchStartHandler: this.onDeckTouch.bind(this),
			touchEndHandler: this.onDeckRelease.bind(this),
			touchMoveHandler: this.onDeckMove.bind(this)
		});

		this.drawer = new Drawer({
			selector: '.js-drawer',
			seekStartHandler: this.onSeekHandler.bind(this)
		});

		// created everytime a track is loaded
		this.sampleCreator = null;

		this.loadSoundCloudTrack(this.dom.selectTrack.value);
		// this.loadUrl('https://s3-us-west-2.amazonaws.com/s.cdpn.io/481938/Find_My_Way_Home.mp3');
	}

	onClickLoadTrack() {
		let url = this.dom.inputTrack.value;

		// reset dropdown
		this.dom.selectTrack.value = '';

		this.loadTrack(url);
	}

	onSelectTrack(e) {
		this.loadTrack(e.target.value);
	}

	/**
	 * Adjust tempo of the motor
	 *
	 * @param {CustomEvent} with the properties `percent` and `value`
	 */
	onSetTempo(e) {
		let detail = e.detail;
		let tempoValue = detail.value;

		this.deck.setTempo(tempoValue);
	}

	onReverbChange(e) {
		let target = e.target;
		let reverbName = target.value;

		if (reverbName === '') {
			this.disconnectConvolver();
		} else {
			let url = `dist/sounds/reverbs/${reverbName}.wav`;

			// url, this.onReverbLoaded, this
			this.bufferLoader.load({
				url,
				succesCallback: this.onReverbLoaded,
				scope: this
			});
		}
	}

	onReverbLoaded(decodedBuffer) {
		console.log('reverb loaded');

		this.convolver.buffer = decodedBuffer;

		// hacky hacky quick and dirty
		this.connectConvolver();
	}

	connectConvolver() {
		try {
			this.disconnectConvolver();
		} catch (e) { }

		this.gainNode.disconnect(this.audioCtx.destination);
		this.gainNode.connect(this.convolver);
		this.convolver.connect(this.audioCtx.destination);
	}

	disconnectConvolver() {
		this.convolver.disconnect(this.audioCtx.destination);
		this.gainNode.disconnect(this.convolver);
		this.gainNode.connect(this.audioCtx.destination);
	}

	loadTrack(url) {
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
	loadSoundCloudTrack(soundCloudUrl) {
		console.log(`resolving SC... ${soundCloudUrl}`);

		SC.resolve(soundCloudUrl).then((response) => {
			let streamUrl = `${response.stream_url}?client_id=${SC_CLIENT_ID}`;
			let imageUrl = response.artwork_url
				? response.artwork_url.replace('large', 'crop')
				: '';

			this.deck.setImage(imageUrl);

			this.loadUrl(streamUrl);
		}, (err) => {
			console.log('error', err);
		});
	}

	/**
	 * Create a XMLHttpRequest to load a URL as arraybuffer
	 *
	 * @param {string} url The URL of the track to load
	 * @see {@link https://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/js/AudioHandler.js}
	 */
	loadUrl(url) {
		console.log('loading buffer...');

		this.bufferLoader.load({
			url,
			succesCallback: this.onAudioDecoded,
			progressCallback: this.onTrackLoading,
			scope: this
		});
	}

	onAudioDecoded(decodedBuffer) {
		console.log('decoding done!');

		this.globalSourceBuffer = decodedBuffer;

		this.initSample(decodedBuffer);

		this.initialize();
	}

	onTrackLoading(progress) {
		// console.log(progress);
	}

	initialize() {
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


	initSample(buffer) {
		// create a samplecreator which can slice a audio buffer into small parts
		this.sampleCreator = new SampleCreator(this.audioCtx, buffer);
	}

	/**
	 * Cancel all sceduled value changes on the playbackRate
	 */
	cancelScheduledPlaybackRate() {
		this.track.source.playbackRate.cancelScheduledValues(this.audioCtx.currentTime);
	}

	onSetVolume(e) {
		let volume = e.target.value;

		this.gainNode.gain.value = volume;
	}

	/**
	 * Callback function for `Deck.touchStartHandler`
	 */
	onDeckTouch() {
		this.track.scratching = true;

		this.pause();
	}

	/**
	 * Callback function for `Deck.touchEndHandler`
	 */
	onDeckRelease(progress) {
		this.track.position = (this.track.duration / 100) * progress;
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
	onDeckMove(speed, progress) {
		let scratchMultiply = timeConfigs.scratchMultiply;

		this.track.position = (this.track.duration * 0.01) * progress;

		speed *= scratchMultiply;
		speed = speed.toFixed(2);

		this.setPlaybackRate(speed, true, true, 0.05);
	}

	/**
	 * Callback function for `Drawer.seekStartHandler`
	 * @param {number} the progress which was clicked in the drawer
	 * @return {void}
	 */
	onSeekHandler(progress) {
		this.track.position = (this.track.duration * 0.01) * progress;

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
	setPlaybackRate(speed = 1, rampDown = false, rampUp = true, time = timeConfigs.scratchRamp) {
		// Note: firefox can't handle `0` value for playbackRate
		// after 0 is reached, it's resetted back to 1
		if (!this.track.source) {
			return;
		}

		let currentPlaybackRate = this.track.source.playbackRate.value;
		let absolutePlaybackRate = Math.abs(speed);

		// round on 2 decimals
		absolutePlaybackRate = Math.round(absolutePlaybackRate * 100) / 100;

		let speedMinus = speed < 0;
		let shouldReverse = this.track.reversed !== speedMinus;

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

	setupSample(sampleTime = timeConfigs.sampleTime) {
		// startTime in MS
		let startTime = this.track.position;

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
	pause() {
		this.setPlaybackRate(0, true);
	}

	/**
	 * Reset the state of the track and reset deck
	 */
	reset() {
		cancelAnimationFrame(this.raf);
		this.motorRunning = false;

		this.deck.toggleMotor(this.motorRunning);
		this.deck.reset();
		this.drawer.reset();

		this.toggleUI(false);

		this.track = Object.assign({}, this.defaultTrackState);
	}

	togglePower() {
		this.motorRunning = false;

		this.deck.toggleMotor(this.motorRunning, true);
	}

	toggleMotor() {
		this.motorRunning = !this.motorRunning;

		this.deck.toggleMotor(this.motorRunning);

		cancelAnimationFrame(this.raf);

		this.play();
	}

	stop() {
		if (this.track.source) {
			this.cancelScheduledPlaybackRate();
			this.track.source.stop(0);
		}


		this.track.started = false;
		this.track.position = 0;

		cancelAnimationFrame(this.raf);
	}

	play() {
		cancelAnimationFrame(this.raf);

		this.track.started = true;

		// stop currently playing track
		if (this.track.source) {
			this.track.source.stop(0);
		}

		this.setupSample(timeConfigs.sampleTime);

		// this.track.source.playbackRate.value = this.trackSpeed;

		this.timerTimestamp = performance.now();
		this.track.source.start(0, 0);

		this.updateLoop = this.updateLoop.bind(this);
		this.updateLoop();
	}

	mute(silent = true) {
		let volume = silent ? 0 : 1;

		this.gainNode.gain.value = volume;
	}

	/**
	 * Updates the current position and progress of the track
	 */
	updateLoop() {
		this.lastFps = fpsMeter.fps;

		if (this.track.started) {
			let now = performance.now();
			let diff = now - this.timerTimestamp;
			let speed = this.trackSpeed;

			let resampleForward;
			let resampleBackward;

			// take speed in account of playback position
			diff *= speed;

			// diff from MS to S
			diff *= 0.001;

			this.track.position += diff;
			this.track.progress = (this.track.position / this.track.duration) * 100;

			// TODO: cleanup this mess
			if ((this.track.position >= this.track.duration) || (this.track.reversed && this.track.position <= 0)) {
				stop();
			} else {
				resampleForward = this.track.position >= this.sampleCreator.duration + this.sampleCreator.offset;
				resampleBackward = this.track.reversed && (this.track.position <= this.sampleCreator.offset - this.sampleCreator.duration);

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

	setScopes() {
		const boundMethods = [
			'togglePower',
			'toggleMotor',
			'onClickLoadTrack',
			'onSelectTrack',
			'onSetVolume',
			'onSetTempo',
			'onReverbChange'
		];

		for (let method of boundMethods) {
			this[method] = this[method].bind(this);
		}
	}

	/**
	 * Adds or removes eventListeners from the DOM UI elements
	 *
	 * @param {bool} enable if true, enables the ui, else disable them
	 */
	toggleUI(enable = true) {
		let func = enable ? 'addEventListener' : 'removeEventListener';

		this.dom.toggleMotor[func]('click', this.toggleMotor);
		this.dom.togglePower[func]('click', this.togglePower);
		this.dom.selectTrack[func]('change', this.onSelectTrack);
		this.dom.loadTrack[func]('click', this.onClickLoadTrack);
		this.dom.volume[func]('input', this.onSetVolume);
		this.dom.sliderTempo[func]('change', this.onSetTempo);
		// for...of, not in chrome
		for (let i = 0; i < this.dom.radiosReverb.length; i++) {
			let radio = this.dom.radiosReverb[i];

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
	getDomElements() {
		return {
			toggleMotor: this.getEl('.js-toggle-motor'),
			togglePower: this.getEl('.js-toggle-power'),
			selectTrack: this.getEl('.js-track-select'),
			inputTrack: this.getEl('.js-track-input'),
			loadTrack: this.getEl('.js-load-track'),
			sliderTempo: new Slider('.js-slider-tempo', { min: 8, max: -8 }),
			volume: this.getEl('.js-volume'),
			output: this.getEl('.js-output'),
			radiosReverb: this.getEl('input[name="reverb"]', true)
		};
	}

	getEl(selector, multiple = false) {
		if (multiple) {
			return this.el.querySelectorAll(selector);
		}

		return this.el.querySelector(selector);
	}

	updateOutput() {
		let speed = this.trackSpeed;

		this.dom.output.innerHTML = `
				fps: ${this.lastFps} <br />
				speed: ${speed}x <br />
				progress: ${this.track.position}s <br />
				${this.track.duration}s <br />
				${Math.round(this.track.progress)}%`;
	}

	/**
	 * Returns current track speed
	 * Depends on user is scratching
	 */
	get trackSpeed() {
		let speed;

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

	get defaultTrackState() {
		return Object.assign({}, TRACK_STATE);
	}

	/**
	 * Used in a `visibilitychange` event handler
	 * If not visible, `isActive` is false and player pauses
	 *
	 * @param {bool} isActive state of the controller
	 * @return {void}
	 */
	setIsActive(isActive) {
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
}

export default Controller;
