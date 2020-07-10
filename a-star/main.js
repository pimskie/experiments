// http://csis.pace.edu/~benjamin/teaching/cs627/webfiles/Astar.pdf

const wallIndices = []; // [1551,323,283,284,285,245,246,247,207,167,168,128,88,722,682,683,684,685,645,646,647,607,608,609,569,570,530,531,491,492,493,453,454,414,374,375,335,336,296,257,217,218,178,138,98,99,1043,1044,1045,1046,1047,1007,1008,1009,1010,970,971,972,932,933,893,894,854,855,856,816,817,777,737,738,698,699,659,660,620,621,581,582,542,502,503,463,464,424,384,385,345,305,306,266,226,227,187,147,148,1405,1406,1407,1408,1409,1369,1370,1371,1372,1373,1374,1334,1335,1336,1296,1297,1298,1258,1259,1219,1220,1221,1181,1182,1142,1143,1103,1104,1064,1065,1025,1026,986,987,947,948,908,909,869,829,830,790,791,751,711,712,672,673,633,593,594,554,514,475,435,395,396,356,316,276,277,237,197,1591,1433,1473,1513,1553,1593,1588,1511,1471,1393,1353,515,555,158,157,117,77,37,118,78,38,1365,1325,1285,1245,1205,1313,1273,1271,1272,1270,1269,1268,1267,1266,1265,1359,1358,1357,1356,1355];
const waterIndices = []; // [957,956,996,997,1036,917,918,878,877,876,836,796,756,716,676,675,715,755,795,755,715,716,676,636,637,638,678,679,678,677,637,636,635,634,594,593,592,591,551,552,553,513,473,474,434,435,395,394,354,353,313,273,274,234,235,872,950,911,951,950,990,989,1029,1069,1068,1108,1107,1106,1146,1145,1185,1184,1183,1223,1222,1221,1261,1260,1300,1299,1300,1260,1261,1221,1222,1182,1183,1184,1185,1186,1187,1147,1148,1108,1109,1069,1029,989,990,950,949,950,951,911,912,872,871,870,910,950,910,337,336,376,416,417,457,458,499,539,538,578,618,658,659,660,700,739,779,778,779,739,699,700,660,659,619,579,539,499,459,458,418,417,377,337,338,298,299,259,258,257,256,296,336,337,377,337,297,296,336,337,377,417,418,458,498,499,539,579,619,618,658,698,738,739,779,778,818,817,857,897,937,897,898,858,818,819,779,778,777,817,857,858,898,899,859,819,779,778,738,698,658,657,697,696,695,696,697,737,777,737,738,698,697,573,609,577,576,575,574,573,572,571,570,568,569,529,530,531,571,572,532,533,493,494,454,494,495,535,536,576,536,576,616,615,614,613,612,611,610,609,569,529,489,490,491,531,532,533,573,574,575,535,534,533,532,572,571,570,610,609,649,689,729,769,768,808,807,806,846,847,848,849,809,769,729,689,649,650,651,611,571,531,532,533,573,613,612,652,692,732,733,773,772];

const qs = sel => document.body.querySelector(sel);
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

let simplex = new SimplexNoise(Math.random());
const cols = 40;
const rows = 40;
const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) / cols);

const fragment = new DocumentFragment();

let closedList = [];
let walls = new Set();
let openList = [];

let grid = [];
let startTile;
let destinationTile;

let turns = 0;

let isPainting = false;
let isRising = false;
let isFlattening = false;

let isDestinationReached = false;
let rafId = null;

const getCurrentTile = () => {
	const [current] = openList.sort((t1, t2) => t1.f - t2.f);

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

// 0.6MS / run
const getNeighbourTiles = (grid, currentTile, ignoreTiles) => {
	const { col: currentCol, row: currentRow, index } = currentTile;
	const wallsNodes = [...walls.values()];

	const colMin = Math.max(currentCol - 1, 0);
	const colMax = Math.min(currentCol + 1, cols - 1);

	const rowMin = Math.max(currentRow - 1, 0);
	const rowMax = Math.min(currentRow + 1, rows - 1);

	const neighbourTiles = [];

	for (let y = rowMin; y <= rowMax; y++) {
		for (let x = colMin; x <= colMax; x++) {
			const surroundingTile = grid[y][x];

			const { node } = surroundingTile;

			const isInClosedList = ignoreTiles.some(tile => tile.node === node) || wallsNodes.some(tile => tile.node === node);

			if (!isInClosedList) {
				neighbourTiles.push(surroundingTile);
			}
		}
	}

	return neighbourTiles;
};

const setParentTile = (parentTile, tile) => {
	tile.parentTile = parentTile;
	tile.node.dataset.parent = parentTile.index;
};

const getTerrainCostG = (tile) => {
	const { level = 0 } = tile;
	const cost = level * 50;

	return cost;
};

const getAdjacentCostG = (tileA, tileB) => {
	const { col: tileACol, row: tileARow } = tileA;
	const { col: tileBCol, row: tileBRow } = tileB;

	const isDiagonal = Math.abs((tileBCol + tileBRow) - (tileACol + tileARow)) - 1 !== 0;
	const cost = isDiagonal ? 14 : 10;

	return cost;
};

const getCostG = (tileA, tileB) => {
	const cost = getAdjacentCostG(tileA, tileB) + getTerrainCostG(tileB);

	return cost;
}

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
	turns = 0;

	openList = [startTile];
	isDestinationReached = false;
	closedList = [];

	grid
	grid.flat().forEach(({ node }) => {
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
	walls = new Set();

	grid.flat().forEach(({ node }) => {
		node.classList.remove('is-level-1', 'is-level-2', 'is-level-3', 'is-level-4');
	});
};

const createNoiseMap = () => {
	simplex = new SimplexNoise(Math.random());

	reset();

	const noiseScale = 0.07;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const noise = simplex.noise2D(col * noiseScale, row * noiseScale);

			const tile = grid[row][col];
			const { node } = tile;

			tile.level = noise;

			node.style.setProperty('--alpha', `${noise}`);
		}
	}
};

const reset = () => {
	cancelAnimationFrame(rafId);

	generateGrid();
	resetPath();
	resetWalls();
};

const walk = (destinationTile) => {
	const then = performance.now();

	while (!isDestinationReached) {


		const currentTile = getCurrentTile();

		closedList.push(currentTile);
		openList = openList.filter(t => t !== currentTile);

		const neighbourTiles = getNeighbourTiles(grid, currentTile, closedList);

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

		turns++;

		if (currentTile.node === destinationTile.node) {
			drawPath(openList[0]);

			isDestinationReached = true;

			console.log('REACHED')
		}

		if (openList.length === 0) {
			isDestinationReached = true;

			console.log('😥 DNF');
		}
	}

	const now = performance.now();
	const time = now - then;

	console.log(`That took ${time.toPrecision(2)}MS, and ${turns} turns`);

	// rafId = requestAnimationFrame(() => walk(destinationTile));

};

const generateGrid = () => {
	let i = 0;

	grid = [];

	qs('.container').innerHTML = '';

	for (let row = 0; row < rows; row++) {
		const y = row * size;

		grid[row] = [];

		for (col = 0; col < cols; col++) {
			const x = col * size;
			const node = document.createElement('div');

			node.classList.add('node');

			node.style.setProperty('--size', `${size}px`);
			node.style.setProperty('--x', `${x}px`);
			node.style.setProperty('--y', `${y}px`);

			node.dataset.col = col;
			node.dataset.row = row;

			fragment.appendChild(node);

			grid[row][col] = { node, col, row, index: i };
			i++;
		}
	}

	qs('.container').append(fragment);

	startTile = grid[0][0];
	destinationTile = grid[rows - 1][cols - 1];

	startTile.node.classList.add('is-start');
	destinationTile.node.classList.add('is-end');

	startTile.g = 0;
	startTile.h = 0;
	startTile.f = 0;

	openList.push(startTile);
};

const isNode = (el) => el.classList && el.classList.contains('node');

const paint = (node, isFlattening) => {
	const { dataset: { col, row } } = node;
	const tile = grid[row][col];

	if (isFlattening) {
		walls.delete(node);
	} else {
		walls.add(node);
	}

	node.classList.toggle('is-closed', !isFlattening);

	// const { dataset: { col, row } } = node;
	// const tile = grid[row][col];
	// let { level = 0 } = tile;

	// level = Math.max(0, level);
	// level += isFlattening ? -0.2 : 0.2;
	// level = Math.max(0, Math.min(level, 1));

	// tile.level = level;

	// tile.node.style.setProperty('--alpha', level);
};

qs('.js-walk').addEventListener('click', () => {
	cancelAnimationFrame(rafId);

	resetPath();
	walk(destinationTile);
});

qs('.js-reset-path').addEventListener('click', () => {
	cancelAnimationFrame(rafId);

	resetPath();
});

qs('.js-reset').addEventListener('click', () => {
	reset();
});

qs('.js-noise').addEventListener('click', () => {
	createNoiseMap();
});


document.body.addEventListener('mousedown', ({ target }) => {
	if (!isNode(target)) {
		return;
	}

	isPainting = true;
});

document.body.addEventListener('mouseup', ({ target }) => {
	isPainting = false;
});

document.body.addEventListener('mouseover', (e) => {
	const { target, ctrlKey } = e;

	if (!isPainting) {
		return;
	}

	if (!isNode(target)) {
		return;
	}

	paint(target, ctrlKey);
});

generateGrid();

wallIndices.forEach(i => addWall(tiles[i].node));
