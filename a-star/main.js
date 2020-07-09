// http://csis.pace.edu/~benjamin/teaching/cs627/webfiles/Astar.pdf

const wallIndices = [1551,323,283,284,285,245,246,247,207,167,168,128,88,722,682,683,684,685,645,646,647,607,608,609,569,570,530,531,491,492,493,453,454,414,374,375,335,336,296,257,217,218,178,138,98,99,1043,1044,1045,1046,1047,1007,1008,1009,1010,970,971,972,932,933,893,894,854,855,856,816,817,777,737,738,698,699,659,660,620,621,581,582,542,502,503,463,464,424,384,385,345,305,306,266,226,227,187,147,148,1405,1406,1407,1408,1409,1369,1370,1371,1372,1373,1374,1334,1335,1336,1296,1297,1298,1258,1259,1219,1220,1221,1181,1182,1142,1143,1103,1104,1064,1065,1025,1026,986,987,947,948,908,909,869,829,830,790,791,751,711,712,672,673,633,593,594,554,514,475,435,395,396,356,316,276,277,237,197,1591,1433,1473,1513,1553,1593,1588,1511,1471,1393,1353,515,555,158,157,117,77,37,118,78,38,1365,1325,1285,1245,1205,1313,1273,1271,1272,1270,1269,1268,1267,1266,1265,1359,1358,1357,1356,1355];

const qs = sel => document.body.querySelector(sel);

const size = 25;
const cols = 40;
const rows = 40;

const fragment = new DocumentFragment();
let closedList = [];
let walls = [];
let openList = [];

let isPainting = false;
let isErasing = false;

let isDestinationReached = false;
let rafId = null;

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
		const isInClosedList = ignoreTiles.some(tile => tile.node === node) || walls.some(tile => tile.node === node);

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
	const { g: currentG } = currentTile;
	const { col: neighbourCol, row: neighbourRow } = neighbourTile;
	const { col: destinationCol, row: destinationRow } = destinationTile;

	const cost = getCostG(currentTile, neighbourTile);

	neighbourTile.g = currentG + cost;
	neighbourTile.h = (Math.abs(destinationCol - neighbourCol) + Math.abs(destinationRow - neighbourRow)) * 10;
	neighbourTile.f = neighbourTile.g + neighbourTile.h;
};

const resetPath = () => {
	openList = [startTile];
	isDestinationReached = false;
	closedList = [];

	tiles.forEach(({ node }) => {
		node.classList.remove('is-neighbour', 'is-path');
	});
};

const drawPath = (tile) => {
	tile.node.classList.add('is-path');

	if (tile.parentTile) {
		drawPath(tile.parentTile);
	}
};

const resetWalls = () => {
	walls = [];

	tiles.forEach(({ node }) => {
		node.classList.remove('is-closed', 'is-neighbour')
	});
};


const reset = () => {
	cancelAnimationFrame(rafId);

	resetPath();
	resetWalls();
};

const walk = (destinationTile) => {
	if (isDestinationReached) {
		return;
	}

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
		// qs('.js-party').play();
		drawPath(openList[0]);

		isDestinationReached = true;

		return;
	}

	rafId = requestAnimationFrame(() => walk(destinationTile));
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

	fragment.appendChild(node);

	return { node, col, row, index: i };
});

const startIndex = 0;
const destinationIndex = tiles.length - 1;
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
	cancelAnimationFrame(rafId);

	resetPath();
	walk(destinationTile);
});

qs('.js-reset').addEventListener('click', () => {
	reset();
});

const isNode = (el) => el.classList && el.classList.contains('node');

const addWall = (node) => {
	walls.push({ node });

	node.classList.add('is-closed');
};

const removeWall = (node) => {
	const index = walls.findIndex(t => t.node === node);

	if (index === -1) {
		return;
	}

	walls.splice(index, 1);
	node.classList.remove('is-closed');
};

const togglePainting = (node) => {
	const isClosed = node.classList.contains('is-closed');

	isErasing = isClosed;
	isPainting = !isClosed;

	paint(node);
};

const paint = (node) => {
	if (isErasing) {
		removeWall(node);
	} else {
		addWall(node);
	}
};

document.body.addEventListener('mousedown', ({ target }) => {
	if (!isNode(target)) {
		return;
	}

	togglePainting(target);
});

document.body.addEventListener('mouseup', ({ target }) => {
	isPainting = false;
	isErasing = false;
});

document.body.addEventListener('mouseover', ({ target }) => {
	if (!isPainting && !isErasing) {
		return;
	}

	if (!isNode(target)) {
		return;
	}

	paint(target);
});

wallIndices.forEach(i => addWall(tiles[i].node));
