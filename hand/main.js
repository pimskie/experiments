// Get the canvas element
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

// Set the initial angular velocity and damping ratio
let w0 = 2;
let z = 0.1;

// Set the initial time
let t = 0;

// Calculate the damped angular frequency
let wd = Math.sqrt(Math.pow(w0, 2) - Math.pow(z, 2));

// Calculate the phase angle
let phi = Math.atan(wd / z);

// Set the initial position of the object
let x = canvas.width / 2;
let y = canvas.height / 2;

// Set the radius of the object
let r = 30;

// Draw the object
function drawObject() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fillStyle = "green";
	ctx.fill();
}

// Animate the object
function animate() {
	// Calculate the angular velocity at the current time
	let wt = w0 * Math.exp(-z * t) * Math.cos(wd * t + phi);

	// Update the position of the object
	x += wt;

	// Draw the object
	drawObject();

	// Update the time
	t += 0.01;

	// Request another animation frame
	requestAnimationFrame(animate);
}

// Start the animation
animate();
