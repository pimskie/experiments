const numDots = 500;
const visual = document.querySelector(".visual");

visual.style.setProperty("--count", numDots);

for (let i = 0; i < numDots; i++) {
	const dot = document.createElement("div");
	dot.classList.add("dot");
	dot.style.setProperty("--index", i);
	dot.style.setProperty("--percent", (i + 1) / numDots);

	visual.appendChild(dot);
}

