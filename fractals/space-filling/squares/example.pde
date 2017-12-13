// Box Fitting
// j.tarbell   January, 2004
// Processing 0085 Beta syntax update April, 2005
// Albuquerque, New Mexico
// complexification.net

int num = 0;
int maxnum = 1000;
int dim = 600;

Box[] boxes;


int maxpal = 256;
int numpal = 0;
color[] goodcolor = new color[maxpal];

// MAIN -----------------------------------------------------------

void setup() {
  size(600,600,P3D);
//  size(dim,dim,P3D);
  framerate(30);

  rectMode(CENTER);
  noStroke();
//   takecolor("bosque2.gif");
  background(255);

  boxes = new Box[maxnum];

  for (int i=0;i<3;i++) {
    makeNewBox();
  }
}

void draw() {
  for (int n=0;n<num;n++) {
    boxes[n].draw();
  }
}

void makeNewBox() {
  if (num<maxnum) {
    boxes[num] = new Box();
    num++;
  }
}




// OBJECTS ------------------------------------------------------


// space filling box
class Box {

  int x;
  int y;
  int d;
  color myc;
  boolean okToDraw;
  boolean chaste = true;

  Box() {
    // random initial conditions
    selfinit();
  }

  void selfinit() {
    // position
    okToDraw = false;
    x = int(random(dim));
    y = int(random(dim));
    d = 0;
    myc = somecolor(1.0*y/dim);
  }

  void draw() {
    expand();
    if (okToDraw) {
      fill(myc);
      rect(x,y,d,d);
    }
  }

  void expand() {
    // assume expansion is ok
    d+=2;

    // look for obstructions around perimeter at width d
    int obstructions = 0;
    for (int j=int(x-d/2-1);j<int(x+d/2);j++) {
      int k=int(y-d/2-1);
      obstructions += checkPixel(j,k);
      k=int(y+d/2);
      obstructions += checkPixel(j,k);
    }
    for (int k=int(y-d/2-1);k<int(y+d/2);k++) {
      int j=int(x-d/2-1);
      obstructions += checkPixel(j,k);
      j=int(x+d/2);
      obstructions += checkPixel(j,k);
    }

    if (obstructions>0) {
      // reset
      selfinit();
      if (chaste) {
        makeNewBox();
        chaste = false;
      }
    } else {
      okToDraw = true;
    }
  }

  int checkPixel(int x, int y) {
    color c = get(x, y);
    if (brightness(c)<254) {
      // a lit pixel has been found
      return 1;
    } else {
      return 0;
    }
  }
}




// COLOR METHODS ---------------------------------------------------

color somecolor(float p) {
  // pick color according to range
  return goodcolor[int(p*numpal)];
}

void takecolor(String fn) {
  PImage b;
  b = loadImage(fn);
  image(b,0,0);

  for (int x=0;x<b.width;x++){
    for (int y=0;y<b.height;y++) {
      color c = get(x,y);
      boolean exists = false;
      for (int n=0;n<numpal;n++) {
        if (c==goodcolor[n]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        // add color to pal
        if (numpal<maxpal) {
          goodcolor[numpal] = c;
          numpal++;
        } else {
          break;
        }
      }
    }
  }

}


// j.tarbell   January, 2004
