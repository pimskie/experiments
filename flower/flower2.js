// PLAY WITH THESE
let radiuSpeed = 2;
let circleSpeed = 5;
let speed = 0.01;

const canvasPath = document.querySelector('.canvas-path');
const ctxPath = canvasPath.getContext('2d');

const canvasDraw = document.querySelector('.canvas-draw');
const ctxDraw = canvasDraw.getContext('2d');

let winWidth;
let winHeight;
let midX;
let midY;

let rafId;

let radius = 0;
let circleAngle = 0;
let radiusAngle = 0;
let maxRadius = 75;

let running = true;

let points = [];
let pointStartX;
let pointStartY;

const lineWidth = 2;
const lineColor = '#5d5d5d';

const clearStage = () => {
  ctxPath.clearRect(0, 0, canvasPath.width, canvasPath.height);
  ctxDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
}

const setStage = () => {
  winWidth = window.innerWidth;
  winHeight = window.innerHeight;

  midX = winWidth * 0.5;
  midY = winHeight * 0.5;

  canvasPath.width = winWidth;
  canvasPath.height = winHeight;

  canvasDraw.width = winWidth;
  canvasDraw.height = winHeight;

  radius = 0;
  circleAngle = 0;
  radiusAngle = 0;

  points = [];

  pointStartX =  midX + Math.cos(circleAngle) * radius;
  pointStartY = midY + Math.sin(circleAngle) * radius;

  clearStage();
  updatePath();
}

const updatePath = () => {
  radius = Math.cos(radiusAngle) * 100;

  // creating new point for line
  let point = {
    x: midX + Math.cos(circleAngle) * radius,
    y: midY + Math.sin(circleAngle) * radius
  };

  radiusAngle += speed * radiuSpeed;
  circleAngle += speed * circleSpeed;

  points.push(point);
}

const draw = () => {
  clearStage();

  updatePath();

  // draw path
  ctxPath.beginPath();
  ctxPath.strokeStyle = lineColor;
  ctxPath.arc(midX, midY, Math.abs(radius), 0, Math.PI * 2);
  ctxPath.stroke();
  ctxPath.closePath();

  // draw point
  ctxDraw.beginPath();
  ctxDraw.strokeStyle = '#fff';
  ctxDraw.moveTo(points[0].x, points[0].y);

  let point;

  for (let i = 1; i < points.length; i++) {
    point = points[i];

    ctxDraw.lineTo(point.x, point.y);
  }

  ctxDraw.stroke();
  ctxDraw.closePath();


  rafId = requestAnimationFrame(draw);
}


window.addEventListener('resize', setStage);
setStage();
draw();

document.addEventListener('mousedown', (e) => {
  running = !running;

  if (running) {
     rafId = requestAnimationFrame(draw);
  } else {
    cancelAnimationFrame(rafId);
  }
});