import '//unpkg.com/simplex-noise@2.4.0/simplex-noise';

let simplex = new SimplexNoise(Math.random());

const TAU = Math.PI * 2;

const canvasDraw = document.createElement('canvas');
const ctxDraw = canvasDraw.getContext('2d');

document.body.appendChild(canvasDraw);

const btnStart = document.querySelector('.js-start');
const btnCapture = document.querySelector('.js-capture');
const video = document.querySelector('.js-video');

const width = 500;
const height = 500;

const midX = width * 0.5;
const midY = height * 0.5;

const painters = [];

let phase = 0;
let rafId;

let pixelData;


canvasDraw.width = width;
canvasDraw.height = height;

const constraints = { video: { width: 500, height: 500 }, audio: false };

navigator.mediaDevices.getUserMedia(constraints)
	.then(function (stream) {
		// Older browsers may not have srcObject
		// Avoid using this in new browsers, as it is going away.
		video.srcObject = stream;

		video.onloadedmetadata = function (e) {
			video.play();
		};

		btnCapture.addEventListener('click', () => {
			ctxDraw.drawImage(video, 0, 0, 500, 500);
		});
	})
	.catch(function (err) {
		console.log(err.name + ": " + err.message);
	});

// navigator.getUserMedia (

// 	// constraints
// 	{
// 	   video: true,
// 	   audio: false
// 	},

// 	// successCallback
// 	function(localMediaStream) {
// 		video = document.querySelector('video');
// 	   video.src = window.URL.createObjectURL(localMediaStream);
// 	   webcamStream = localMediaStream;
// 	},

// 	// errorCallback
// 	function(err) {
// 	   console.log("The following error occured: " + err);
// 	}
//  );
