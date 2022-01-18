const TAU = Math.PI * 2;

class Disc {
	constructor(el) {
		this.el = el;

		this.center = this.getElementCenter();
		this.angle = 0;
		this.progress = 0;

		this.onDragStart = this.onDragStart.bind(this);
		this.onDragProgress = this.onDragProgress.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);

		this.el.addEventListener('pointerdown', this.onDragStart);
	}

	onDragStart(e) {
		this.center = this.getElementCenter();

		document.body.addEventListener('pointermove', this.onDragProgress);
		document.body.addEventListener('pointerup', this.onDragEnd);
	}

	onDragProgress({ clientX, clientY }) {
		this.angle = Math.atan2(clientY - this.center.y, clientX - this.center.x);

		this.updateState();
	}

	onDragEnd() {
		document.body.removeEventListener('pointermove', this.onDragProgress);
		document.body.removeEventListener('pointerup', this.onDragEnd);
	}

	updateState() {
		this.progress = (this.angle % TAU) / TAU;

		this.el.style.transform = `rotate(${this.angle}rad)`;
	}

	getElementCenter() {
		const { left, top, width, height }  = this.el.getBoundingClientRect();

		const x =  left + width / 2;
		const y =  top + height / 2;

		return { x, y };
	}

	getLocalPointer(mouseEvent) {
		const { left, top } = this.el.getBoundingClientRect();

		const x = mouseEvent.clientX - left;
		const y = mouseEvent.clientY - top;

		return { x, y };
	}
}

export default Disc;
