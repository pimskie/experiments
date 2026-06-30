const getElement = (dataRef) => document.body.querySelector(`[data-ref=${dataRef}]`);

const stillContainer = getElement('still-container');
const videoContainer = getElement('video-container');
const header = getElement('header');
const video = getElement('video');
const aside = getElement('aside');

const transitionVideo = (isShowing = true) => {
    header.classList.toggle('is-open', isShowing);
    stillContainer.classList.toggle('is-hidding', isShowing);
    aside.inert = isShowing;

    if (isShowing) {
        video.play();
    }
}

const onStillPointerDown = () => {
    transitionVideo();
}

const onVideoPause = () => {
    transitionVideo(false);
}

stillContainer.addEventListener('pointerdown', onStillPointerDown);
video.addEventListener('pause', onVideoPause);
