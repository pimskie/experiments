const size = 50;
const cols = 7;
const rows = 5;
const spacing = 10;

const fragment = new DocumentFragment();
const nodeMap = new Map();
const closedList = [];

let currentNode;
let openList = [];

const onNodeHover = ({ target: node }) => {
	const { col, row } = nodeMap.get(destinationNode);
	console.log(node.dataset.index);
};

const walk = () => {
	currentNode.classList.add('is-current');

	const { col: startCol, row: startRow } = nodeMap.get(currentNode);
	const { col: destinationCol, row: destinationRow } = nodeMap.get(destinationNode);

	const surroundingNodes = nodes.filter((node, index) => {
		const { col, row } = nodeMap.get(node);

		return !closedList.includes(node) && node !== currentNode && col >= startCol - 1 && col <= startCol + 1 && row >= startRow - 1 && row <= startRow + 1;
	});

	// determine scores
	surroundingNodes.forEach((node) => {
		const { col, row } = nodeMap.get(node);
		const isDiagonal = Math.abs((col + row) - (startCol + startRow)) - 1 !== 0;

		node.classList.add('is-adjacent');
		node.classList.toggle('is-diagonal', isDiagonal);

		const g = isDiagonal ? 14 : 10;
		const h = (Math.abs(destinationCol - col) + Math.abs(destinationRow - row)) * 10;
		const f = g + h;

		node.textContent = f;

		openList.push({ node, f });
	});

	openList = openList
		.filter(({ node }) => node !== currentNode)
		.sort((a, b) => a.f - b.f);

	closedList.push(currentNode);

	currentNode = openList[0].node;
};

const nodes = new Array(cols * rows).fill().map((_, i) => {
	const col = i % cols;
	const row = Math.floor(i / cols);

	const x = col * size;
	const y = row * size;

	const node = document.createElement('div');

	node.classList.add('node');
	node.style.setProperty('--x', `${x}px`);
	node.style.setProperty('--y', `${y}px`);

	node.dataset.index = i;

	node.addEventListener('mouseover', onNodeHover);
	fragment.appendChild(node);

	nodeMap.set(node, { col, row });

	return node;
});

const startIndex = 15;
const destinationIndex = 19;
const startNode = nodes[startIndex];
const destinationNode = nodes[destinationIndex];

currentNode = startNode;

closedList.push(nodes[10]);
closedList.push(nodes[17]);
closedList.push(nodes[24]);

closedList.forEach(node => node.classList.add('is-closed'));

startNode.textContent = 'S';
destinationNode.textContent = 'D';

document.querySelector('.container').append(fragment);

document.body.addEventListener('click', () => {
	walk();
});
