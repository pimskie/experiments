class Controls {
	constructor({ toggleButton }) {
		this.toggleButton = toggleButton;

		this.isPlaying = false;
		this.isDisabled = true;


		this.toggleButton.addEventListener('click', e => this.toggle(e));
	}

	set label(text) {
		this.toggleButton.textContent = text;
	}

	set isDisabled(disabled) {
		this.toggleButton.disabled = disabled;
	}


	toggle() {
		this.isPlaying = !this.isPlaying;

		this.label = this.isPlaying
			? 'Pause'
			: 'Play';

		this.onIsplayingChanged(this.isPlaying);
	}

	onIsplayingChanged() {
		//
	}

}

export default Controls;
