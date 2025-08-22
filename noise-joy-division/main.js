const canvas = document.body.querySelector("canvas");
const ctx = canvas.getContext("2d");

const w = 300;
const h = 400;
const midY = h * 0.5;

const numLines = 20;
const numLineSegments = 70;

noise.seed(Math.random());

canvas.width = w;
canvas.height = h;

let rafId = null;
let phase = 0;

const drawLine = (
	ctx,
	startX,
	startY,
	canvasWidth,
	canvasHeight,
	segments,
	noiseGen,
	tick
) => {
	const centerX = canvasWidth >> 1;

	ctx.beginPath();
	ctx.strokeStyle = "#fff";
	ctx.fillStyle = "#000";

	ctx.moveTo(startX, startY);

	// loop over each line segment
	for (let i = 0; i < segments; i++) {
		// calucate the x position
		const currentX = (canvasWidth / (segments - 1)) * i;

		// calculate the distance to the center (0 is edge, 1 is center)
		const distFromCenter = Math.abs(centerX - currentX);
		const centerProximity = 1 - distFromCenter / centerX;

		// get a noise value to add to the y position
		// using a third, updating value to get a diffent value each loop
		const noiseVal = noiseGen.perlin3(currentX * 0.01, startY * 0.01, tick);

		const yOffset = centerProximity * (100 * noiseVal);
		const currentY = startY - yOffset;

		ctx.lineTo(currentX + 2, currentY);
	}

	// draw the shape off bounds and fill it
	ctx.lineTo(canvasWidth + 2, canvasHeight + 2);
	ctx.lineTo(-2, canvasHeight + 2);
	ctx.lineTo(-2, startY + 2);

	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

const loop = () => {
	ctx.clearRect(0, 0, w, h);

	for (let i = 0; i < numLines; i++) {
		const startX = 0;
		const startY = (h / numLines) * i;

		// add a time component to the `drawLine` function
		drawLine(ctx, startX, startY, w, h, numLineSegments, noise, phase);
	}

	// update the time component
	phase += 0.005;

	rafId = requestAnimationFrame(loop);
};

canvas.addEventListener("click", () => {
	noise.seed(Math.random());
});

loop();

