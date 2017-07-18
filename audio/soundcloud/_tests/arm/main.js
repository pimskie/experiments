const PI = Math.PI;
const TO_DEGREE = 180 / PI;
const TO_RADIAN = PI / 180;

const ANGLE_START = 10 * TO_RADIAN;
const ANGLE_END = 50 * TO_RADIAN;
const ANGLE_DIFF = ANGLE_END - ANGLE_START;

class Arm {
	constructor(el) {
		this.el = el;
		this.elRect = this.el.getBoundingClientRect();
		this.isDragging = false;

		this.addEventListeners();
	}

	addEventListeners() {
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);

		this.el.addEventListener('mousedown', this.onTouchStart);
	}

	onTouchStart(e) {
		this.isDragging = true;
		this.clickPos =  {
			x: this.elRect.left + (this.elRect.width >> 1),
			y: this.elRect.top
		}; // this.getMousePos(e);

		document.addEventListener('mousemove', this.onTouchMove);
		document.addEventListener('mouseup', this.onTouchEnd);
	}

	onTouchEnd(e) {
		this.isDragging = false;
		document.removeEventListener('mousemove', this.onTouchMove);
	}

	onTouchMove(e) {
		let currentPos = this.getMousePos(e);
		let angle = this.angleBetween(this.clickPos, currentPos) - (90 * TO_RADIAN);

		// clamp
		angle = Math.min(Math.max(angle, 0), ANGLE_END);

		this.el.style.transform = `rotate(${angle * TO_DEGREE}deg)`;
	}

	getMousePos(mouseEvent) {
		return {
			x: mouseEvent.clientX,
			y: mouseEvent.clientY
		}
	}

	angleBetween(pos1, pos2) {
		return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
	}
}


let arm = new Arm(document.querySelector('.js-arm'));