const simplex = new SimplexNoise();
const pixelIndex = (x, y, width) => (~~x + ~~y * width) * 4;

const imageBase = 'https://www.pimskie.dev/public/assets';
const imageSources = ['mona-lisa-500.jpg', 'mozart-500.jpg', 'vermeer-500.jpg'];

let images = [];

const TAU = Math.PI * 2;

const cols = 40;
const rows = cols;

const width = 500;
const height = width;

const spaceX = width / cols;
const spaceY = height / rows;

const ctxGhost = document.querySelector('.ghost').getContext('2d');
const ctx = document.querySelector('.canvas').getContext('2d');

ctx.canvas.width = ctxGhost.canvas.width = width;
ctx.canvas.height = ctxGhost.canvas.height = height;

const config = {
	index: 0,
	time: 100,
	scale: 0,
	tiles: [],
	loop: false,
};

const loadImages = async () => await Promise.all(imageSources.map((source) => {
  return new Promise((resolve, reject) => {
	const image = new Image();

	image.crossOrigin = 'Anonymous';
	image.addEventListener('load', () => {
	  resolve(image);
	});

	image.src = `${imageBase}/${source}`;
  });
}));

const getImageData = (image) => {
  ctxGhost.drawImage(image, 0, 0);

  return ctxGhost.getImageData(0, 0, width, height).data;
};

const getTiles = (imageData) => {
  const tiles = new Array(cols * rows).fill().map((_, index) => {
	let col = index % cols;
	let row = Math.floor(index / cols);

	const x = col * spaceX;
	const y = row * spaceY;

	const originalX = x;
	const originalY = y;

	const pixel = pixelIndex(x, y, width);
	const r = imageData[pixel];
	const g = imageData[pixel + 1];
	const b = imageData[pixel + 2];
	const color = { r, g, b };
	const brightness = (r + g + b) / 765;
	const w = spaceX;
	const h = spaceY;
	const speed = 2 +( Math.random() * 2);
	const angle = 0;
	const originalAngle = angle;

	return { x, y, originalX, originalY, w, h, color, brightness, speed, angle, originalAngle };
  });

  return tiles;
};

const getTilesConfig = (index) => {
	const image = images[index];

	const imageData = getImageData(image);
	const tiles = getTiles(imageData);

	config.tiles = tiles;
};


const drawTiles = (tiles, scale) => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	tiles.forEach((tile) => {
		const { x, y, color } = tile;

		ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b})`;
		ctx.beginPath();
		ctx.fillRect(x, y, spaceX * scale, spaceY * scale);
		ctx.closePath();
		ctx.fill();
	});
};

const updateTiles = (tiles, time) => {
	tiles.forEach((tile) => {
		let angleIncrease = TAU * (tile.brightness);
		let distance = 0;
		const noiseScale = 0.001;
		const increase = 0.3;

		for (let i = 0; i <= time; i += increase) {
			angleIncrease += simplex.noise2D((tile.originalX * noiseScale), (tile.originalY * noiseScale)) * 0.01;
			distance += tile.speed * 0.4;
		}

		tile.angle = tile.originalAngle + angleIncrease;
		tile.x = tile.originalX + (Math.cos(tile.angle) * distance);
		tile.y = tile.originalY + (Math.sin(tile.angle) * distance);
	});
};

const gogogo = () => {
	gsap.defaults({
		onUpdate: () => {
			updateTiles(config.tiles, config.time);
			drawTiles(config.tiles, config.scale)
		},
	});

	const tl = gsap.timeline({
		onComplete: () => {
			setTimeout(() => {
				tl.restart();
			}, 2000);
		}
	});

	tl.to(config, { time: 0, scale: 1.2, duration: 3, ease: 'power2.out' });
	tl.to(config, { time: 100, scale: 0, delay: 1, ease: 'power3.in', duration: 3, onComplete: () => {
		config.index = (config.index + 1 + images.length) % images.length;

		getTilesConfig(config.index);
	} });
};

const start = async () => {
	images = await loadImages();

	getTilesConfig(config.index);

	gogogo();
};

start();
