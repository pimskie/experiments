import easingMethods from "./easing.js";

const ctx = document.querySelector(".js-canvas").getContext("2d");
const { canvas } = ctx;

const TAU = Math.PI * 2;
const W = 500;
const H = 500;

const MX = W >> 1;
const MY = H >> 1;

let tick = 1;

canvas.width = W;
canvas.height = H;

const easing = easingMethods.easeOutQuad;

// vertice.z = easingFunc(this.tick, vertice.startZ, vertice.startZ - vertice.destZ, duration);

const clear = () => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.fillRect(0, 0, W, H);
};

const getPosition = () => {
  const y = MY;
  const orgY = y;
  const destY = orgY + (-100 + Math.random() * 200);
  const diffY = y - destY;

  console.log(destY);

  return {
    y,
    orgY,
    destY,
    diffY,
  };
};

const dots = Array.from({ length: 50 }, () => {
  const x = W * Math.random();
  const position = getPosition();

  return {
    x,
    ...position,
  };
});

const draw = (dot) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(dot.x, dot.y, 3, 0, TAU);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

const loop = () => {
  clear();

  const duration = 200;

  if (tick < duration) {
    dots.forEach((dot, i) => {
      dot.y = easing(tick, dot.orgY, dot.diffY, duration);
      draw(dot);
    });
  } else {
    dots.forEach((dot, i) => {
      dots[i] = {
        ...dots[i],
        ...getPosition(),
      };

      tick = 0;
    });
  }

  tick++;

  requestAnimationFrame(loop);
};

loop();
