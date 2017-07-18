/**
 * FPS Meter
 * Ripped from:
 * http://stackoverflow.com/questions/4787431/check-fps-in-js
 */

class FPSMeter {
	constructor() {
		this.filterStrength = 1 / 10;
		this.frameTime = 0;
		this.lastTime = new Date(); // performance.now();

		this._fps = 0;
	}

	get fps() {
		// let now = performance.now();

		// this._fps = 1000 / (now - this.lastTime);

		// this.lastTime = now;

		// return this._fps;

		let now = new Date();
		let delay = now - this.lastTime;
		this._fps += (delay - this._fps) / 10;
		this.lastTime = now;

		return 1000 / this._fps;
	}
}

const fpsMeter = new FPSMeter();

export default fpsMeter;
