import easingMethods from "./easing.js";

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

noise.seed(Math.random());

const ctx = document.querySelector(".js-canvas").getContext("2d");
const { canvas } = ctx;

const TAU = Math.PI * 2;
const W = 700;
const H = 300;

const MX = W >> 1;
const MY = H >> 1;

let tick = 1;

canvas.width = W;
canvas.height = H;

const easing = easingMethods.easeOutCubic;

const getDot = ({ x, index }) => {
  return {
    index,
    x,
    y: 0,
    phase: 0,
    duration: 5,
    velocity: 0,
    velocitySpecial: 0,

    update() {
      this.phase += 1;

      this.y += this.velocity + this.velocitySpecial;
      this.y = clamp(this.y, 0, H - 0);

      const amp = 1;
      const scale = 0.01;

      this.velocity += (-amp + Math.random() * (amp * 2)) * 0.001;
      //   this.velocity =
      //     noise.simplex3(this.x * scale, this.y * scale, tick * scale) * 0.05;
    },

    reset(startY) {
      const amp = 10;

      this.phase = 0;

      this.startY = startY;
      this.destY = startY + (-amp + Math.random() * (amp * 2));
      this.diffY = this.destY - startY;
      this.y = startY;
    },
  };
};
const clear = () => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
  ctx.fillRect(0, 0, W, H);
};

const numDots = 1000;
const spacing = W / numDots;

const dots = Array.from({ length: numDots }, (_, i) => {
  const dot = getDot({ x: spacing * i, index: i });

  dot.reset(MY);

  return dot;
}).sort((a, b) => a.x - b.x);

const draw = (dot) => {
  ctx.fillStyle = "#aaa";

  ctx.beginPath();
  ctx.arc(dot.x, dot.y, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();

  // ctx.beginPath();
  // ctx.moveTo(dot.x, dot.y);
  // ctx.lineTo(dot.x, dot.y + (dot.velocitySpecial + dot.velocity) * 10);
  // ctx.closePath();
  // ctx.stroke();
};

const loop = () => {
  clear();

  dots.forEach((dot, i) => {
    const { index } = dot;

    dot.velocitySpecial = dots
      .filter((d) => d.index < index)
      .reduce((sum, d) => {
        return sum + d.velocity;
      }, 0);

    dot.update();

    draw(dot);
  });

  tick++;

  requestAnimationFrame(loop);
};

loop();
