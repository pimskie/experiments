import timeConfig from './configs/times';

const PI = Math.PI;
const TO_DEGREE = 180 / PI;
const TO_RADIAN = PI / 180;

// bring in the magic numbers
const ARM_MAX_ROTATION = 46;
const ARM_MIN_ROTATION = 24;
const ARM_ROTATION = ARM_MAX_ROTATION - ARM_MIN_ROTATION;

class Deck { // eslint-disable-line no-unused-vars
	constructor(options = { selector: '.js-turntable', duration: 30 }) {
		Object.assign(this, options);

		this.el = document.querySelector(options.selector);

		this.disc = this.el.querySelector('.js-disc');
		this.arm = this.el.querySelector('.js-arm');
		this.motor = this.el.querySelector('.js-motor');

		this.elRect = this.disc.getBoundingClientRect();

		this.init();
	}

	init() {
		this.mouseDown = false;

		this.touchStartHandler = this.touchStartHandler || this.noop;
		this.touchEndHandler = this.touchEndHandler || this.noop;
		this.touchMoveHandler = this.touchMoveHandler || this.noop;

		this.radiansDiffHistory = [];
		this.maxHistory = 30;

		this.discRotation = 0;

		this.motorRunning = false;
		this.motorRotation = 0;
		this.motorMaxSpeed = timeConfig.motorMax; // can be alted by setting tempo
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

	noop() {
		// placeholder
	}

	addEventHandlers() {
		this.mouseDownHandler = (e) => {
			this.onMouseDown(e);
		};

		this.mouseUpHandler = (e) => {
			this.onMouseUp(e);
		};

		this.mouseMoveHandler = (e) => {
			this.onMouseMove(e);
		};

		this.disc.addEventListener('mousedown', this.mouseDownHandler);
	}


	onMouseDown(e) {
		let mousePosition = this.getDiscMousePosition(e);

		this.mouseDown = true;

		this.radians.mouse = Math.atan2(mousePosition.y - this.midY, mousePosition.x - this.midX);

		document.body.addEventListener('mousemove', this.mouseMoveHandler);
		document.body.addEventListener('mouseup', this.mouseUpHandler);

		document.body.classList.add('is-scratching');

		this.touchStartHandler();
	}

	onMouseUp(e) {
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
	onMouseMove(e) {
		const mousePosition = this.getDiscMousePosition(e);
		const mouseAngle = Math.atan2(mousePosition.y - this.midY, mousePosition.x - this.midX);

		const diffAngle = this.getAngleDiff(this.radians.mouse, mouseAngle);
		const newRotation = this.radians.rotated + diffAngle;

		if (newRotation <= 0 || newRotation >= this.radians.total) {
			return;
		}

		this.radians.rotated = newRotation;
		this.radians.mouse = mouseAngle;

		this.rotateDisc(this.radians.rotated);
		if (!this.isFalsePositive(diffAngle)) {
			let progress = this.progress;
			let avgDiff = this.getAverageDiff(diffAngle);

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
	isFalsePositive(angleChange, treshold = 5) {
		this.radiansDiffHistory.unshift(angleChange);
		this.radiansDiffHistory = this.radiansDiffHistory.slice(0, this.maxHistory);

		if (this.radiansDiffHistory.length < this.maxHistory) {
			return false;
		}

		let directions = this.radiansDiffHistory.filter((num) => {
			if (angleChange < 0) {
				return num < 0;
			}

			return num > 0;
		});

		return directions.length < treshold;
	}

	getAverageDiff(diff) {
		if (this.radiansDiffHistory.length === 0) {
			return diff;
		}

		// http://jsperf.com/speedy-summer-upper
		// let sum = this.radiansDiffHistory.reduce((a, b) => a + b);

		// in favor of speed
		let sum = 0;
		let length = this.radiansDiffHistory.length;
		let i;

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
	rotateDisc(angle) {
		this.disc.style.transform = `rotate(${angle * TO_DEGREE}deg)`;
	}

	rotateArm(progress) {
		let rotation = (ARM_ROTATION / 100) * progress;
		let armRotation = ARM_MIN_ROTATION + rotation;

		this.arm.style.transform = `rotate(${armRotation}deg)`;
	}

	/**
	 * Sets the total turns the deck can make, depending on the duration
	 * TODO: update interval in a loop: http://stackoverflow.com/questions/4787431/check-fps-in-js
	 *
	 * @param {Number} duration the duration of the track in seconds
	 */
	setDuration(duration) {
		let fps = 60;
		let totalFrames = fps * duration;
		let totalRotations = totalFrames * timeConfig.motorMax;

		this.radians.total = totalRotations * TO_RADIAN;
	}

	setImage(imageUrl) {
		this.el.querySelector('.js-disc-image').style.backgroundImage = `url(${imageUrl})`;
	}

	/**
	 * called from controller. Sets rotation of the disc
	 *
	 * @param {Number} progress of track playback in percent
	 */
	setProgress(progress) {
		let rotation = (this.radians.total / 100) * progress;

		this.radians.rotated = rotation;
		this.discRotation = rotation * TO_DEGREE;

		this.rotateArm(progress);
	}

	/**
	 * Increases or decreases the speed of the motor
	 *
	 * @param {Number} tempoIncrease a percentual value. Can be negative and positive;
	 */
	setTempo(tempoIncrease) {
		this.motorMaxSpeed = timeConfig.motorMax + ((timeConfig.motorMax * 0.01) * tempoIncrease);
	}

	/**
	 * Toggle state of the motor
	 * If switched on, motorSpeed increases, else it decreases
	 * If the powered is switched of, motorSpeed decreases slower
	 *
	 * @param {Bool} on if motor is switched on (true) or off (false)
	 * @param {Bool} powerDown if the power went down (true) or not (false)
	 */
	toggleMotor(on, powerDown = false) {
		cancelAnimationFrame(this.raf);

		this.motorRunning = on;

		if (powerDown === true) {
			this.motorSlope = timeConfig.powerOff;
		} else {
			this.motorSlope = on
				? timeConfig.motorOn
				: timeConfig.motorOff;
		}

		this.motorLoop = this.motorLoop.bind(this);
		this.motorLoop();
	}

	motorLoop() {
		if (this.motorSpeed + this.motorSlope >= 0 ||
			this.motorSpeed + this.motorSlope <= this.motorMaxSpeed) {
			this.motorSpeed += this.motorSlope;
		}

		// clamp
		this.motorSpeed = Math.min(Math.max(this.motorSpeed, 0), this.motorMaxSpeed);

		this.motorRotation += this.motorSpeed;

		this.motor.style.transform = `rotate(${this.motorRotation}deg)`;

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

	reset() {
		this.radians = Object.assign({}, this.radiansDefault);

		this.rotateDisc(this.radians.rotated);
		this.rotateArm(0);
	}

	/**
	 * Returns normalized value of motorSpeed (0 - 1)
	 *
	 * @return {Number} the normalized motorSpeed
	 */
	get motorSpeedFactor() {
		return this.motorSpeed / timeConfig.motorMax;
	}

	get progress() {
		let rotation = this.radians.rotated;
		let progress = (rotation / this.radians.total) * 100;

		return progress;
	}

	getAngleDiff(angleStart, angleTarget) {
		return Math.atan2(Math.sin(angleTarget - angleStart), Math.cos(angleTarget - angleStart));
	}

	// TODO:
	// find a better solution for this
	getDiscMousePosition(evt) {
		// http://stackoverflow.com/questions/8389156/what-substitute-should-we-use-for-layerx-layery-since-they-are-deprecated-in-web
		let el = evt.target;
		let x = 0;
		let y = 0;

		while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
			x += el.offsetLeft - el.scrollLeft;
			y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}

		x = evt.clientX - x;
		y = evt.clientY - y;

		return { x, y };
	}
}

export default Deck;
