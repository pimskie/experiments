/**
 * Creates a slider (duh)
 *
 * Returns the DOMNode with which the slider was created
 */
class Slider {
	constructor(selector, values = { min: 0, max: 1 }) {
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
			this.maxValue = this.sliderHeight - (this.handleRect.height);
		}

		this.slideEvent = new Event('change');

		this.setScopes();
		this.addEventListeners();
		this.updatePosition();

		return this.slider;
	}

	setScopes() {
		let methods = [
			'handleClick',
			'handleRelease',
			'sliderMouseOver',
			'sliderMouseOut',
			'sliderMouseWheel',
			'sliderMouseClick',
			'handleMove'
		];

		for (let method of methods) {
			this[method] = this[method].bind(this);
		}
	}

	addEventListeners() {
		this.handle.addEventListener('mousedown', this.handleClick);
		this.slider.addEventListener('mouseover', this.sliderMouseOver);
		this.slider.addEventListener('mouseout', this.sliderMouseOut);
		this.slider.addEventListener('click', this.sliderMouseClick);
	}

	updatePosition() {
		// clamp
		this.currentPos = Math.min(
			Math.max(this.currentPos, this.minValue),
			this.maxValue + this.minValue
		);

		this.handle.style[this.styleProp] = `${this.currentPos}px`;

		this.dispatchChangeEvent();
	}

	dispatchChangeEvent() {
		let percent = ((this.currentPos - this.minValue) / this.maxValue) * 100;

		if (this.direction === 'v') {
			percent = 100 - percent;
		}

		let valuesDiff = this.values.max - this.values.min;
		let value = ((valuesDiff * 0.01) * percent) + this.values.min;

		value = parseFloat(value.toFixed(2));
		percent = parseFloat(percent.toFixed(2));

		this.slideEvent.detail = { percent, value };
		this.slider.dispatchEvent(this.slideEvent);
	}

	sliderMouseWheel(e) {
		e.preventDefault();

		let speed = this.direction === 'h' ? -5 : 5;

		if (e.deltaY < 0) {
			speed = -speed;
		}

		this.currentPos += speed;

		this.updatePosition();
	}

	sliderMouseOver() {
		this.slider.addEventListener('mousewheel', this.sliderMouseWheel);
	}

	sliderMouseOut() {
		this.slider.removeEventListener('mousewheel', this.sliderMouseWheel);
	}

	sliderMouseClick(e) {
		let clickOffset;

		if (this.direction === 'h') {
			clickOffset = e.pageX - this.offset;
		} else {
			clickOffset = e.pageY - this.offset - (this.handleHalfHeight * 0.5);
		}

		this.currentPos = clickOffset;
		this.updatePosition();
	}

	handleMove(e) {
		let newOffset;

		if (this.direction === 'h') {
			newOffset = e.pageX - this.handleHalfHeight;
		} else {
			newOffset = e.pageY;
		}

		this.currentPos = newOffset - this.offset;
		this.updatePosition();
	}

	handleClick(e) {
		document.addEventListener('mousemove', this.handleMove);
		document.addEventListener('mouseup', this.handleRelease);
	}

	handleRelease() {
		document.removeEventListener('mousemove', this.handleMove);
		document.removeEventListener('mouseup', this.handleRelease);
	}
}

export default Slider;
