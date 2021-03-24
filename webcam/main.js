const video = document.querySelector('video');
const init = async () => {
	const constraints = { video: true, audio: true };

	const stream = await navigator.mediaDevices.getUserMedia(constraints);

	video.srcObject = stream;
	video.play();
	video.controls = true;
	video.muted = true;
};


init();
