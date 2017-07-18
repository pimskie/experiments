

class BufferLoader {
	/**
	 * @param {AudioContext} ctx an optional audiocontext
	 */
	constructor(ctx = new AudioContext()) {
		this.ctx = ctx;

		this.request = null;
	}

	noop() {
		// placeholder
	}

	/**
	 * Load an URL into a buffer
	 *
	 * @param {String} url audio file to load
	 * @param {Function} callback resolve function
	 * @param {Object} scope scope to bind callback to
	 * @return {XMLHttpRequest} request the current request used
	 */
	load(options = {}) {
		let url = options.url;
		let scope = options.scope || this;

		this.progressCallback = (options.progressCallback || this.noop).bind(scope);
		this.succesCallback = (options.succesCallback || this.noop).bind(scope);

		this.request = new XMLHttpRequest();

		this.request.responseType = 'arraybuffer';
		this.request.open('GET', url, true);

		console.log(`this.request.open ${url}`);

		this.request.addEventListener('progress', this.onRequestProgress.bind(this));
		this.request.addEventListener('load', this.onRequestLoaded.bind(this));

		this.request.send();

		return this.request;
	}

	onRequestProgress(e) {
		if (e.lengthComputable) {
			let total = e.total;
			let loaded = e.loaded;
			let percent = ((loaded / total) * 100).toFixed(2);

			this.progressCallback(percent);
		} else {
			this.progressCallback('loading...');
		}
	}

	onRequestLoaded(e) {
		let response = e.target.response;

		this.decodeAudioData(response);
	}

	/**
	 * Decode arrayBuffer
	 *
	 *
	 * @param {LoadEvent} load event as result of XMLHttpRequest
	 */
	decodeAudioData(response) {
		console.log('decoding...');
		this.ctx.decodeAudioData(response)
			.then(this.succesCallback, () => {
				throw new Error('error in decoding audio');
			});
	}
}

export default BufferLoader;
