// http://csis.pace.edu/~benjamin/teaching/cs627/webfiles/Astar.pdf

const qs = sel => document.body.querySelector(sel);

const size = 25;
const cols = 50;
const rows = 50;

const fragment = new DocumentFragment();
let closedList = [];
let openList = [];

const toggleIsClosed = (node) => {
	const isClosed = node.classList.contains('is-closed');

	if (isClosed) {
		closedList = closedList.filter(({ node: n }) => n !== node);
	} else {
		closedList.push({ node });
	}

	node.classList.toggle('is-closed');
};

const getCurrentTile = () => {
	const [current] = openList
		.sort((t1, t2) => t1.h - t2.h)
		.sort((t1, t2) => t1.h - t2.h);

	return current;
};

const markCurrent = (tile) => {
	const { node } = tile;

	if (qs('.is-current')) {
		qs('.is-current').classList.remove('is-current');
	}

	node.classList.add('is-current')
};

const markOpenTile = tile => tile.node.classList.add('is-neighbour');

const getNeighbourTiles = (allTiles, currentTile, ignoreTiles) => {
	const { col: currentCol, row: currentRow } = currentTile;

	const surroundingTiles = allTiles.filter((tile) => {
		const { node, col, row } = tile;
		const isInClosedList = ignoreTiles.some(ignore => ignore.node === node);

		return !isInClosedList && col >= currentCol - 1 && col <= currentCol + 1 && row >= currentRow - 1 && row <= currentRow + 1;
	});

	return surroundingTiles;
};

const setParentTile = (parentTile, tile) => {
	tile.parentTile = parentTile;
	tile.node.dataset.parent = parentTile.index;
};

const getCostG = (tileA, tileB) => {
	const { col: tileACol, row: tileARow } = tileA;
	const { col: tileBCol, row: tileBRow } = tileB;

	const isDiagonal = Math.abs((tileBCol + tileBRow) - (tileACol + tileARow)) - 1 !== 0;
	const increment = isDiagonal ? 14 : 10;

	return increment;
};

const updatePathProperties = (currentTile, neighbourTile, destinationTile) => {
	const {  g: currentG } = currentTile;
	const { col: neighbourCol, row: neighbourRow } = neighbourTile;
	const { col:destinationCol, row:destinationRow } = destinationTile;

	const cost = getCostG(currentTile, neighbourTile);

	neighbourTile.g = currentG + cost;
	neighbourTile.h = (Math.abs(destinationCol - neighbourCol) + Math.abs(destinationRow - neighbourRow)) * 10;
	neighbourTile.f = neighbourTile.g + neighbourTile.h;

	// neighbourTile.node.innerHTML = `
	// 	F: ${neighbourTile.f} <br/>
	// 	G: ${neighbourTile.g} <br />
	// 	H: ${neighbourTile.h}
	// `;
};

const walk = (destinationTile) => {
	const currentTile = getCurrentTile();

	closedList.push(currentTile);
	openList = openList.filter(t => t !== currentTile);

	const neighbourTiles = getNeighbourTiles(tiles, currentTile, closedList);

	markCurrent(currentTile);

	neighbourTiles.forEach((neighbourTile) => {
		if (!openList.includes(neighbourTile)) {
			openList.push(neighbourTile);

			markOpenTile(neighbourTile);
			setParentTile(currentTile, neighbourTile);
			updatePathProperties(currentTile, neighbourTile, destinationTile);
		} else {
			const { g: currentG } = currentTile;
			const { g: neighbourG } = neighbourTile;
			const incrementG = getCostG(currentTile, neighbourTile);

			const newG = neighbourG + incrementG;

			if (newG < currentG) {
				setParentTile(currentTile, neighbourTile);
				updatePathProperties(currentTile, neighbourTile, destinationTile);
			}
		}
	});

	if (currentTile.node === destinationTile.node) {
		qs('.js-party').play();

		return;
	}
};

const tiles = new Array(cols * rows).fill().map((_, i) => {
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

	node.addEventListener('click', e => toggleIsClosed(node));

	fragment.appendChild(node);

	return { node, col, row, index: i };
});

const startIndex = Math.floor(tiles.length * Math.random());
const destinationIndex = Math.floor(tiles.length * Math.random());
const startTile = tiles[startIndex];
const destinationTile = tiles[destinationIndex];

startTile.node.classList.add('is-start');
destinationTile.node.classList.add('is-end');

startTile.g = 0;
startTile.h = 0;
startTile.f = 0;
startTile.node.textContent = 'S';
destinationTile.node.textContent = 'D';

openList.push(startTile);

qs('.container').append(fragment);

qs('.js-walk').addEventListener('click', () => {
	walk(destinationTile);
});

for (let i = 0; i < 9; i++) {
	// walk(destinationTile);
}
