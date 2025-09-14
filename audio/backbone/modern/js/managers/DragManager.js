import { addEvent, removeEvent, setStyle } from "../utils/dom.js";

/**
 * Manages drag and drop functionality for components
 */
export class DragManager {
	constructor() {
		this.draggingElement = null;
		this.isDragging = false;
		this.zIndex = 1;
		this.startX = 0;
		this.startY = 0;
		this.initialX = 0;
		this.initialY = 0;

		this.init();
	}

	init() {
		console.log("DragManager init");
		this.setupEventListeners();
	}

	setupEventListeners() {
		// Mouse events
		document.addEventListener("mousedown", (e) => {
			if (e.target.classList.contains("drag")) {
				this.startDrag(e);
			}
		});

		document.addEventListener("mousemove", (e) => {
			if (this.isDragging) {
				this.drag(e);
			}
		});

		document.addEventListener("mouseup", () => {
			if (this.isDragging) {
				this.stopDrag();
			}
		});

		// Touch events for mobile support
		document.addEventListener("touchstart", (e) => {
			if (e.target.classList.contains("drag")) {
				e.preventDefault();
				this.startDrag(e.touches[0]);
			}
		});

		document.addEventListener("touchmove", (e) => {
			if (this.isDragging) {
				e.preventDefault();
				this.drag(e.touches[0]);
			}
		});

		document.addEventListener("touchend", () => {
			if (this.isDragging) {
				this.stopDrag();
			}
		});
	}

	startDrag(e) {
		this.draggingElement = e.target.parentElement;
		this.isDragging = true;
		this.zIndex += 1;

		// Get initial positions
		this.startX = e.clientX;
		this.startY = e.clientY;

		const rect = this.draggingElement.getBoundingClientRect();
		this.initialX = rect.left;
		this.initialY = rect.top;

		// Set z-index
		setStyle(this.draggingElement, {
			zIndex: this.zIndex,
		});

		// Add dragging class for visual feedback
		this.draggingElement.classList.add("dragging");
	}

	drag(e) {
		if (!this.draggingElement || !this.isDragging) return;

		// Calculate new position
		const deltaX = e.clientX - this.startX;
		const deltaY = e.clientY - this.startY;

		const newX = this.initialX + deltaX;
		const newY = this.initialY + deltaY;

		// Update position
		setStyle(this.draggingElement, {
			left: newX + "px",
			top: newY + "px",
		});

		// Redraw connection lines
		if (window.connectionManager) {
			window.connectionManager.drawLines();
		}
	}

	stopDrag() {
		if (this.draggingElement) {
			this.draggingElement.classList.remove("dragging");
		}

		this.draggingElement = null;
		this.isDragging = false;
	}
}

