const container = document.querySelector(".container");

for (let i = 0; i < 100; i++) {
	const circle = document.createElement("div");
	circle.classList.add("circle");
	container.appendChild(circle);
}

