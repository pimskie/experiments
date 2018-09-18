import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js?foo=bar';

const canvas = Utils.qs('canvas');
const ctx = canvas.getContext('2d');

const controls = Utils.qsa('.js-control');

const TAU = Math.PI * 2;

const W = 500;
const H = 500;

ctx.canvas.width = W;
ctx.canvas.height = H;

const drops = [];
const DROP_MAX_AGE = 50;
let phase = 0;

const mousePrevious = {
  x: null,
  y: null,
};

class Drop {
  constructor(pos, angle, speed, lightness) {
    this.pos = pos;

    this.angle = angle;
    this.speed = speed;

    this.lightness = lightness;

    this.age = 0;
    this.aging = 0.2 + (Math.random() * 0.75);

	this.isDead = false;

	this.phase = 0;
  }

  update() {
    this.age += this.aging;
	this.phase += 0.02;

	this.hue =  Utils.map(Math.sin(this.phase) * 100, -100, 100, 0, 50);
	this.radius = Math.sin(this.phase) * 50;

	this.isDead = this.radius <= 0;

    this.pos.x += Math.cos(this.angle) * this.speed;
    this.pos.y += Math.sin(this.angle) * this.speed;

  }

  draw(ctx) {
	const { x, y } = this.pos;

	const darker = Math.max(0, this.lightness - 10)
	const stroke = `hsla(${this.hue}, 100%, ${darker}%, 1)`;
	const fill = `hsla(${this.hue}, 100%, ${this.lightness}%, 0.2)`;

    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.arc(x, y, this.radius, 0, TAU, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

const clear = () => {
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
  clear();

  drops.forEach((drop, index) => {
    drop.update();

    if (drop.isDead) {
      drops.splice(index, 1);
    } else {
		drop.draw(ctx);
	}
  });

  phase += 0.05;

  requestAnimationFrame(loop);
};

const onPointerMove = (e) => {
  const target = (e.touches && e.touches.length) ? e.touches[0] : e;
  const { clientX, clientY } = target;

  const x = clientX - canvas.offsetLeft;
  const y = clientY - canvas.offsetTop;

  const lightness = Utils.map(Math.cos(phase) * 100, -100, 100, 30, 60);

  const pos = { x, y };

  if (!mousePrevious.x) {
    mousePrevious.x = pos.x;
    mousePrevious.y = pos.y;

    return;
  }

  const angle = Utils.angleBetween(mousePrevious, pos);
  const speed = Utils.distanceBetween(pos, mousePrevious) * 0.1;

  drops.push(new Drop(pos, angle, speed, lightness));

  mousePrevious.x = pos.x;
  mousePrevious.y = pos.y;
};

const updateCSSVars = () => {
  canvas.style.filter = controls.map((control) => {
    const { value, dataset: { property, unit = '' }} = control;

    return `${property}(${value}${unit})`;
  }).join(' ');
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);

controls.forEach((control) => {
  control.addEventListener('input', () => updateCSSVars())
});

updateCSSVars();
loop();

