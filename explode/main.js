const randomBetween = (min, max) => Math.random() * (max - min) + min;
const distanceBetween = (vec1, vec2) =>
	Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const detail = 20;
const cols = detail;
const rows = detail;

const center = {
	x: cols * 0.5,
	y: rows * 0.5,
};

const tileWidthPercentage = 100 / detail;
const tilebackgroundSize = detail * 100;

const container = document.querySelector("#container");

const list = new DocumentFragment();

for (let y = 0; y < rows; y++) {
	const offsetY = y * tileWidthPercentage;

	for (let x = 0; x < cols; x++) {
		const offsetX = x * tileWidthPercentage;
		const destY = randomBetween(-300, 300);

		const distanceToCenter = distanceBetween(center, { x, y });

		const div = document.createElement("div");
		div.classList.add("tile");

		div.style.setProperty("--w", `${tileWidthPercentage}`);
		div.style.setProperty("--x", `${offsetX}`);
		div.style.setProperty("--y", `${offsetY}`);
		div.style.setProperty("--dest-y", `${destY}`);
		div.style.setProperty("--bg-size", `${tilebackgroundSize}`);
		div.style.setProperty("--distance", `${distanceToCenter}`);

		list.append(div);
	}
}

container.append(list);

container.addEventListener("mousedown", () => {
	container.classList.toggle(
		"exploded",
		container.classList.contains("exploded") === false
	);
});

