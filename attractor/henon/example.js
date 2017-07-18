// henon phase diagram. Based on code from j tarbell
// www.complexification.net/gallery/machines/henonPhase/
// and from mathworld.wolfram.com/HenonMap.html

// number of points to draw in each iteration
let dim = 500;
let gs = 1;
let ga = 4;
let gc = 3;
let cnt;
let fadebg;
let num = 0;
const maxnum = 1000;
const numpoints = 1000;
let travelers = new Array(maxnum);

// frame counter for animation
let time;
const goodcolor = ["#000000", "#6b6556", "#a09c84", "#908b7c", "#79746e", "#755d35", "#937343", "#9c6b4b"];
function somecolor() {
  // pick some random color from goodcolor array
  return goodcolor[floor(random(goodcolor.length))];
}

// JS classes are not hoisted so we should do classes first
class TravelerHenon {
  constructor(_ox, _oy) {
    this.ox = _ox;
    this.oy = _oy;
    // set travel position
    this.x = _ox;
    this.y = _oy;
    this.myc = color(goodcolor[floor(gc+floor(goodcolor.length*this.ox))%goodcolor.length]);
    // this.myc = color("#6b6556");
  }
  display() {
    // move through time
    let t = this.x*cos(ga) - (this.y - this.x*this.x) * sin(ga);
    this.y = this.x*sin(ga) + (this.y - this.x*this.x) * cos(ga);
    this.x = t;
    // render
    stroke(this.myc);
    point((this.x/gs + .5)*dim, (this.y/gs + .5)*dim);
  }
  render() {
    for (let i = 0; i < maxpoints; i++) {
      this.display();
    }
  }
  rebirth() {
    this.x = ox;
    this.y = oy;
    myc = color(goodcolor[floor(gc+floor(goodcolor.length*this.ox))%goodcolor.length]);
  }
}

function newHenon() {
  fadebg = 255;
  ga = random(TWO_PI);
  gc = int(random(goodcolor.length));
  for (let i = 0; i < num; i++) {
    travelers[i].rebirth();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  dim = min(width, height);
  background(255);
  noStroke();

  // make some travelers
  for (let i = 0; i < maxnum; i++) {
    let tx = random(0, 1);
    travelers[i] = new TravelerHenon(tx, 0.0);
    num++;
  }
}

function draw() {
  if (fadebg > 0) {
    cnt++;
    if ((cnt%5) == 0) {
      fill(255, 255, 255, 50);
      rectMode(CORNERS);
      rect(0, 0, dim-1, dim-1);
      fadebg -= 50;
    }
  }
  for (let i = 0; i < num; i++) {
    travelers[i].display();
  }
}