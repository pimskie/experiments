/**
 * Service for managing recording sessions
 */

/**
 * Simple EventEmitter implementation for browser
 */
class EventEmitter {
	constructor() {
		this.events = {};
	}

	/**
	 * Register an event listener
	 * @param {string} event - Event name
	 * @param {Function} listener - Event handler
	 */
	on(event, listener) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(listener);
		return this;
	}

	/**
	 * Remove an event listener
	 * @param {string} event - Event name
	 * @param {Function} listener - Event handler to remove
	 */
	off(event, listener) {
		if (!this.events[event]) return this;

		const index = this.events[event].indexOf(listener);
		if (index > -1) {
			this.events[event].splice(index, 1);
		}
		return this;
	}

	/**
	 * Emit an event
	 * @param {string} event - Event name
	 * @param {...any} args - Arguments to pass to listeners
	 */
	emit(event, ...args) {
		if (!this.events[event]) return false;

		this.events[event].forEach((listener) => {
			listener.apply(this, args);
		});
		return true;
	}

	/**
	 * Register a one-time event listener
	 * @param {string} event - Event name
	 * @param {Function} listener - Event handler
	 */
	once(event, listener) {
		const onceWrapper = (...args) => {
			listener.apply(this, args);
			this.off(event, onceWrapper);
		};
		return this.on(event, onceWrapper);
	}
}

export const Emitter = new EventEmitter();

