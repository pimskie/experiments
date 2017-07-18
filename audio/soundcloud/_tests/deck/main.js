const PI = Math.PI;
const TO_DEGREE = 180 / PI;
const TO_RADIAN = PI / 180;

class Deck {
    constructor(selector = '.js-deck') {
        this.el = document.querySelector(selector);
        this.elRect = this.el.getBoundingClientRect();

        this.init();
    }

    init() {
        this.mouseDown = false;

        this.radians = {
            current: 0, // current rotation (-PI - PI)
            previous: 0, // previous rotation (-PI - PI)
            rotated: 0, // total rotation (0 - *)
            rotatedPrevious: 0, // previous total rotation (0 - *)
            rotatedDiff: 0, // difference in rotation
            touchStart: 0 // angle of pointer
        };

        this.midX = this.elRect.width >> 1;
        this.midY = this.elRect.height >> 1;

        this.addEventHandlers();
    }

    addEventHandlers() {
        this.mouseDownHandler = (e) => { this.onMouseDown(e) };
        this.mouseUpHandler = (e) => { this.onMouseUp(e) };
        this.mouseMoveHandler = (e) => { this.onMouseMove(e) };

        this.el.addEventListener('mousedown', this.mouseDownHandler);
    }


    onMouseDown(e) {
        this.mouseDown = true;
        this.radians.touchStart = Math.atan2(e.clientY - this.midY, e.clientX - this.midX);

        this.el.addEventListener('mousemove', this.mouseMoveHandler);
        document.body.addEventListener('mouseup', this.mouseUpHandler);
    }

    onMouseUp(e) {
        this.mouseDown = false;
        this.radians.current = this.radians.previous;

        this.el.removeEventListener('mousemove', this.mouseMoveHandler);
        document.body.removeEventListener('mouseup', this.mouseUpHandler);
    }

    onMouseMove(e) {
        let mouseAngle = Math.atan2(e.clientY - this.midY, e.clientX - this.midX);
        let diffAngle = this.radians.touchStart - mouseAngle;

        this.setRotatedRadians(this.radians.previous, this.radians.current, diffAngle);

        if (this.radians.rotated <= 0) {
            return;
        }

        this.radians.previous = this.radians.current - diffAngle;

        this.el.style.transform = `rotate(${this.radians.rotated * TO_DEGREE}deg)`;
    }

    setRotatedRadians(previousAngle, currentAngle, diffAngle) {
        let newAngle = currentAngle - diffAngle;
        let diffNewAngle = newAngle - previousAngle;

        if (Math.abs(diffNewAngle) < PI && (this.radians.rotated + diffNewAngle >= 0)) {
            this.radians.rotatedPrevious = this.radians.rotated;
            this.radians.rotated += diffNewAngle;

            this.radians.rotatedDiff = this.radians.rotated - this.radians.rotatedPrevious;
        }
    }

    // util method
    throttle(fn, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;

            var now = +new Date,
                args = arguments;
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshhold);
            } else {
                last = now;
                fn.apply(context, args);
            }
        };
    }
}

let deck = new Deck();