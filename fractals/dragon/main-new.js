const SEGMENT_WIDTH = 5;

const ctx = document.querySelector('canvas').getContext('2d');

const drawSet = (path, x, y, segmentAngle) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	let angle = 0;

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#ff0000';

	ctx.moveTo(x, y);

	path.forEach((turn) => {
		x -= Math.cos(angle) * SEGMENT_WIDTH;
		y += Math.sin(angle) * SEGMENT_WIDTH;

		ctx.lineTo(x, y);

		angle += segmentAngle * turn;
	});

	ctx.stroke();
	ctx.closePath();

}

const getPath = (currentPath, currentDepth, maxDepth) => {
	/*
	each iteration is formed by taking the previous iteration,
	adding an R at the end, and then taking the original iteration again, flipping it retrograde,
	swapping each letter and adding the result after the R.
	https://en.wikipedia.org/wiki/Dragon_curve#.5BUn.5DFolding_the_Dragon
	*/
	currentPath = currentPath.concat([-1].concat(currentPath
		.slice()
		.reverse()
		.map((turn) => turn * -1)
	));

	return currentPath;
}

let tween;

const reset = () => {
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	let path = [];
	let depth = 12;

	while (depth--) {
		path = getPath(path);
	}

	const anim = {
		angle: -Math.PI * 0.5
	};

	TweenMax.killAll();

	tween = TweenMax.to(anim, 5, {
		angle: Math.PI * 0.5,
		yoyo: true,
		repeat: -1,
		repeatDelay: 2,
		ease: Sine.easeInOut,
		onUpdate: () => {
			drawSet(
				path,
				window.innerWidth >> 1,
				window.innerHeight >> 1,
				anim.angle
			);
		}
	});
}

window.addEventListener('resize', reset);
reset();