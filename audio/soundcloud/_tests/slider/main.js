class Slider {
	constructor(selector) {
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
			this.offset = this.sliderRect.top;
			this.currentPos = this.sliderRect.height * 0.5;
			this.minValue = this.handleHalfHeight;
			this.maxValue = this.sliderHeight;
		}

		this.setScopes();
		this.addEventListeners();
		this.updatePosition();
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

		let percent = ((this.currentPos - this.minValue) / this.maxValue) * 100;

		if (this.direction === 'v') {
			percent = 100 - percent;
		}
	}

	sliderMouseWheel(e) {
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
			clickOffset = e.pageX - this.sliderRect.left;
		} else {
			clickOffset = e.pageY - this.sliderRect.top + this.handleHalfHeight;
		}

		this.currentPos = clickOffset;
		this.updatePosition();
	}

	handleMove(e) {
		let newOffset = (this.direction === 'h') ? e.pageX : e.pageY;

		this.currentPos = newOffset - this.offset + this.minValue;
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


let slider = new Slider('.js-slider');
let slider2 = new Slider('.js-slider2');



// function updatePosition() {
// 	// clamp
// 	currentPos = Math.min(Math.max(currentPos, handleHalfHeight), sliderHeight + handleHalfHeight);
// 	handle.style.top = `${currentPos}px`;

// 	let percent = 100 - (((currentPos - handleHalfHeight) / sliderHeight) * 100);
// 	console.log(percent);
// }

// function sliderMouseWheel(e) {
// 	speed = 2;

// 	if (e.deltaY < 0) {
// 		// up
// 		currentPos -= speed;
// 	} else {
// 		currentPos += speed;
// 	}

// 	updatePosition();
// }

// function sliderMouseOver() {
// 	slider.addEventListener('mousewheel', sliderMouseWheel);
// }

// function sliderMouseOut() {
// 	slider.removeEventListener('mousewheel', sliderMouseWheel);
// }


// function handleMove(e) {
// 	let newY = e.pageY;

// 	currentPos = e.pageY - sliderRect.top + handleHalfHeight;
// 	updatePosition();
// }

// function handleClick(e) {
// 	document.addEventListener('mousemove', handleMove);
// 	document.addEventListener('mouseup', handleRelease);

// 	mouseY = e.screenY;
// }

// function handleRelease() {
// 	document.removeEventListener('mousemove', handleMove);
// 	document.removeEventListener('mouseup', handleRelease);
// }

