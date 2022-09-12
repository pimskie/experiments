/// SCALE
const count = 50;

for (let i = 0; i < count; i++) {
	const scale = 1 - (i / count);

	drawCircle(scale, frame);
}
