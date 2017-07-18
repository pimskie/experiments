let audioCtx = new AudioContext();
let url = 'http://mdn.github.io/decode-audio-data/viper.ogg';

loadBuffer(url);

function loadBuffer(url) {
    console.log('loading buffer...');

    let request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.addEventListener('load', (e) => {
        decodeAudioData(e.target.response);
    });

    request.send();
}

function decodeAudioData(response) {
    audioCtx.decodeAudioData(response).then((decodedBuffer) => {
        console.log(`Decoding audio done`);

        let source = audioCtx.createBufferSource();
        source.buffer = decodedBuffer;

        let gainNode = audioCtx.createGain();
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.01;

        source.start(0);
        source.playbackRate.value = 1;

        var waveArray = new Float32Array(2);
        waveArray[0] = 1;
        waveArray[1] = 0.05;

        setInterval(() => {
            console.log(source.playbackRate.value, gainNode.gain.value);
        }, 100);

        document.querySelector('.js-wobble').onclick = function () {
            gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 2);

            source.playbackRate.setValueAtTime(1.1, audioCtx.currentTime);
            source.playbackRate.linearRampToValueAtTime(2, audioCtx.currentTime + 2);
            source.playbackRate.linearRampToValueAtTime(0.001, audioCtx.currentTime + 2.3);

            // BUGGED IN FF!
            // source.playbackRate.setValueCurveAtTime(waveArray, audioCtx.currentTime, 2);

        }
    });
}