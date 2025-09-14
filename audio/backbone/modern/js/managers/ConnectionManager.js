import {
	$,
	$$,
	getOffset,
	addClass,
	removeClass,
	hasClass,
} from "../utils/dom.js";

/**
 * Manages visual connections between audio components
 */
export class ConnectionManager {
	constructor() {
		this.canvasCtx = null;
		this.firstComponent = null;
		this.firstDirection = null;
		this.secondComponent = null;
		this.secondDirection = null;
		this.connecting = false;
		this.connections = new Map();

		this.init();
	}

	init() {
		console.log("ConnectionManager init");
		this.setupCanvas();
		this.setupResizeHandler();
	}

	setupCanvas() {
		const canvas = $("#canvas");
		this.canvasCtx = canvas.getContext("2d");
		this.resizeCanvas();
	}

	setupResizeHandler() {
		window.addEventListener("resize", () => {
			this.resizeCanvas();
			this.drawLines();
		});
	}

	resizeCanvas() {
		this.canvasCtx.canvas.width = window.innerWidth;
		this.canvasCtx.canvas.height = window.innerHeight;
	}

	connect(component, direction) {
		if (!this.connecting) {
			this.firstComponent = component;
			this.firstDirection = direction;
			this.connecting = true;
		} else {
			if (this.firstComponent === component) {
				console.log("error: same component");
				this.reset();
			} else if (this.firstDirection === direction) {
				console.log("error: same direction");
				this.reset();
			} else if (this.checkIsConnected(this.firstComponent, component)) {
				console.log("already connected");
				this.reset();
			} else {
				console.log("connected");
				this.secondComponent = component;
				this.secondDirection = direction;
				this.makeConnection();
				this.connecting = false;
			}
		}
	}

	disconnect(component, direction) {
		// Remove all connections involving this component
		for (const [outputId, connection] of this.connections) {
			if (
				connection.view === component ||
				connection.children.includes(component)
			) {
				this.connections.delete(outputId);
			}
		}

		// Clear visual states
		const inputEl = component.getElement().querySelector(".input");
		const outputEl = component.getElement().querySelector(".output");

		if (inputEl) {
			removeClass(inputEl, "connected");
			removeClass(inputEl, "active");
		}
		if (outputEl) {
			removeClass(outputEl, "connected");
			removeClass(outputEl, "active");
		}

		// Clear component references
		component.connectedViewIn = null;
		component.connectedViewOut = null;

		this.drawLines();
	}

	checkIsConnected(output, input) {
		const connection = this.connections.get(output.id);
		if (!connection) {
			return false;
		}
		return connection.children.includes(input);
	}

	makeConnection() {
		// Update visual states
		const firstEl = this.firstComponent
			.getElement()
			.querySelector(`.${this.firstDirection}`);
		const secondEl = this.secondComponent
			.getElement()
			.querySelector(`.${this.secondDirection}`);

		removeClass(firstEl, "active");
		addClass(firstEl, "connected");
		removeClass(secondEl, "active");
		addClass(secondEl, "connected");

		// Determine input and output
		let input, output;
		if (this.firstDirection === "input") {
			input = this.firstComponent;
			output = this.secondComponent;
		} else {
			input = this.secondComponent;
			output = this.firstComponent;
		}

		// Set up component references
		output.connectedViewOut = input;
		input.connectedViewIn = output;

		// Connect audio nodes
		output.controls.output.connect(input.controls.input);

		// Store connection
		if (!this.connections.has(output.id)) {
			this.connections.set(output.id, { view: output, children: [] });
		}
		this.connections.get(output.id).children.push(input);

		this.drawLines();
	}

	drawLines() {
		// Clear canvas
		this.canvasCtx.clearRect(
			0,
			0,
			this.canvasCtx.canvas.width,
			this.canvasCtx.canvas.height
		);

		// Draw all connections
		for (const [outputId, connection] of this.connections) {
			const outputView = connection.view;
			const children = connection.children;

			const startElement = outputView.getElement().querySelector(".output");
			const startOffset = getOffset(startElement);
			const lineStartPoint = {
				left: startOffset.left + startElement.offsetWidth / 2,
				top: startOffset.top + startElement.offsetHeight / 2,
			};

			for (const child of children) {
				const endElement = child.getElement().querySelector(".input");
				const endOffset = getOffset(endElement);
				const lineEndPoint = {
					left: endOffset.left + endElement.offsetWidth / 2,
					top: endOffset.top + endElement.offsetHeight / 2,
				};

				this.drawConnectionLine(lineStartPoint, lineEndPoint);
			}
		}
	}

	drawConnectionLine(start, end) {
		this.canvasCtx.beginPath();
		this.canvasCtx.moveTo(start.left, start.top);
		this.canvasCtx.lineTo(end.left, end.top);
		this.canvasCtx.lineWidth = 3;
		this.canvasCtx.strokeStyle = "#4a90e2";
		this.canvasCtx.stroke();
	}

	reset() {
		// Remove active states from all input/output elements
		const activeElements = $$(".input.active, .output.active");
		activeElements.forEach((el) => {
			removeClass(el, "active");
		});

		this.firstDirection = null;
		this.firstComponent = null;
		this.secondDirection = null;
		this.secondComponent = null;
		this.connecting = false;
	}
}

