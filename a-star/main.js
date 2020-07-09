// http://csis.pace.edu/~benjamin/teaching/cs627/webfiles/Astar.pdf

const size = 75;
const cols = 7;
const rows = 5;
const spacing = 10;

const fragment = new DocumentFragment();
const nodeMap = new Map();
const closedList = [];
let openList = [];

const onNodeHover = ({ target: node }) => {
	const { col, row } = nodeMap.get(destinationNode);
	// console.log(node.dataset.index);
};

const getLowestFromOpen = () => {

	const [lowest] = openList.sort((a, b) => a.f - b.f);

	return lowest;
};

const walk = () => {
	if (document.querySelector('.is-current')) {
		document.querySelector('.is-current').classList.remove('is-current');
	}

	const { node: currentNode, g: currentG, index: currentIndex } = getLowestFromOpen();

	openList = openList.filter(n => n.node !== currentNode);
	closedList.push(currentNode);

	currentNode.classList.add('is-current');

	const { col: currentCol, row: currentRow } = nodeMap.get(currentNode);
	const { col: destinationCol, row: destinationRow } = nodeMap.get(destinationNode);

	const surroundingNodes = nodes.filter((node, index) => {
		const { col, row } = nodeMap.get(node);

		return !closedList.includes(node) && node !== currentNode && col >= currentCol - 1 && col <= currentCol + 1 && row >= currentRow - 1 && row <= currentRow + 1;
	});

	// determine scores
	surroundingNodes.forEach((surroundingNode) => {
		let g;
		let h;
		let f;

		const { col, row } = nodeMap.get(surroundingNode);
		const isDiagonal = Math.abs((col + row) - (currentCol + currentRow)) - 1 !== 0;

		surroundingNode.classList.add('is-adjacent');
		surroundingNode.classList.toggle('is-diagonal', isDiagonal);

		surroundingNode.classList.add('is-adjacent');
		surroundingNode.classList.toggle('is-diagonal', isDiagonal);

		let inOpenList = openList.find(o => o.node === surroundingNode);

		if (!inOpenList) {
			g = currentG + (isDiagonal ? 14 : 10);
			h = (Math.abs(destinationCol - col) + Math.abs(destinationRow - row)) * 10;
			f = g + h;

			openList.push({
				node: surroundingNode,
				parent: currentNode,
				f,
				g,
				h,
			});

			surroundingNode.dataset.parent = currentIndex;
		} else {
			const { g: savedG } = surroundingNode;
			const increment = isDiagonal ? 14 : 10;
			const newG = currentG + increment;


			if (newG < savedG) {
				console.log(surroundingNode, newG, savedG);

				g = newG;

				surroundingNode.g = newG;
				surroundingNode.f = newG + surroundingNode.h;
				surroundingNode.parent = currentNode;
			}
		}


		// const g = isDiagonal ? 14 : 10;
		// const h = (Math.abs(destinationCol - col) + Math.abs(destinationRow - row)) * 10;
		// const f = g + h;


		inOpenList = openList.find(o => o.node === surroundingNode);
		console.log(inOpenList);

		g = inOpenList.g;
		f = inOpenList.f;
		h = inOpenList.h;

		inOpenList.node.innerHTML = `G: ${g} <br /> F: ${f} <br /> H: ${}`;

		// openList.push({ node, f });
	});

	return;

	openList = openList
		.filter(({ node }) => node !== currentNode)
		.sort((a, b) => a.f - b.f);


	currentNode = openList[0].node;

	currentNode.classList.add('is-current');

	console.log('Now i am at', currentNode)
};

const nodes = new Array(cols * rows).fill().map((_, i) => {
	const col = i % cols;
	const row = Math.floor(i / cols);

	const x = col * size;
	const y = row * size;

	const node = document.createElement('div');

	node.classList.add('node');
	node.style.setProperty('--size', `${size}px`);
	node.style.setProperty('--x', `${x}px`);
	node.style.setProperty('--y', `${y}px`);

	node.dataset.content = i;

	node.dataset.index = i;

	node.addEventListener('mouseover', onNodeHover);
	fragment.appendChild(node);

	nodeMap.set(node, { col, row, index: i });

	return node;
});

const startIndex = 15;
const destinationIndex = 19;
const startNode = nodes[startIndex];
const destinationNode = nodes[destinationIndex];

closedList.push(nodes[10]);
closedList.push(nodes[17]);
closedList.push(nodes[24]);

closedList.forEach(node => node.classList.add('is-closed'));

startNode.textContent = 'S';
destinationNode.textContent = 'D';

openList.push({
	node: startNode,
	f: 0,
	g: 0,
	h: null,
	parent: null,
	index: startIndex,
});

document.querySelector('.container').append(fragment);

document.body.addEventListener('click', () => {
	walk();
});
