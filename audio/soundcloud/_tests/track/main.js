/* global SC */

// http://www.schillmania.com/content/entries/2011/wheels-of-steel/
// https://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/js/AudioHandler.js
// https://github.com/jaz303/audio-buffer-utils/blob/master/index.js
// http://mdn.github.io/decode-audio-data/
// http://stackoverflow.com/questions/22073716/create-a-waveform-of-the-full-track-with-web-audio-api

const USE_SC = true;
const CLIENT_ID = '2c6869e4a458d26865a2a11040c5a623';
const TRACK_URL = 'http://mdn.github.io/decode-audio-data/viper.ogg'; //'https://soundcloud.com/theupbeats/dr-kink';

SC.initialize({
    client_id: CLIENT_ID
});

let audioCtx = new AudioContext();
let gainNode = audioCtx.createGain();
let globalSourceBuffer;

let sourceForwards;
let sourceBackwards;
let soundDuration;

if (USE_SC) {
    // https://soundcloud.com/lucas-portela-1/non-phixion-its-us
    console.log(`resolving SC URL...`);
    SC.resolve('https://soundcloud.com/univisionradio/pura-vida-by-donomar-30sec-preview').then((response) => {
        let streamUrl = `${response.stream_url}?client_id=${CLIENT_ID}`;
        loadBuffer(streamUrl);
    });
} else {
    loadBuffer('http://mdn.github.io/decode-audio-data/viper.ogg');
}

/**
 * Load a URL as arraybuffer
 * see https://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/js/AudioHandler.js
 */
function loadBuffer(url) {
    console.log('loading buffer...');

    let request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.addEventListener('load', (e) => {
        decodeAudioData(e.target.response);
    });

    request.send();
}

/**
 * Decode audio file data
 * see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/decodeAudioData
 */
function decodeAudioData(response) {
    console.log(`Decoding audio...`);
    audioCtx.decodeAudioData(response).then((buffer) => {
        console.log(`Decoding audio done`);

        globalSourceBuffer = buffer;

        play();
    });
}

/**
 * create bufferSourceNode wich can play audio data from an audioBuffer
 * see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createBufferSource
 */
function createSources(buffer) {
    let createStart = Date.now();

    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
    sourceForwards = audioCtx.createBufferSource();
    sourceBackwards = audioCtx.createBufferSource();

    sourceForwards.name = 'forwards';
    sourceBackwards.name = 'backwards';

    let bufferBackwards = audioCtx.createBuffer(2, buffer.length, buffer.sampleRate);
    soundDuration = buffer.duration;

    // copy buffer1 to bufferBackwards
    bufferBackwards.getChannelData(0).set(buffer.getChannelData(0), 0);
    bufferBackwards.getChannelData(1).set(buffer.getChannelData(1), 0);

    // reverse bufferBackwards
    bufferBackwards.getChannelData(0).reverse();
    bufferBackwards.getChannelData(1).reverse();

    sourceForwards.buffer = buffer;
    sourceForwards.loop = true;

    sourceBackwards.buffer = bufferBackwards;
    sourceBackwards.loop = true;

    sourceForwards.addEventListener('ended', () => {
        console.log('forwards ended');
    });
    sourceBackwards.addEventListener('ended', () => {
        console.log('backwards ended');
    });

    sourceForwards.connect(gainNode);
    sourceBackwards.connect(gainNode);

    gainNode.gain.value = 0.01;

    gainNode.connect(audioCtx.destination);
}

let sourcePlaying;
let isReversed = false;
let isPaused = false;

let playbackRate = 1;
let absolutePlaybackRate = 1;
let previousPlaybackRate = 1;
let audioStartedTime;

let btnPlay = document.querySelector('.js-play');
let btnPause = document.querySelector('.js-pause');
let visual = document.querySelector('.js-visual');
let toggle = document.querySelector('.js-toggle');
let output = document.querySelector('.js-output');
let rangeRate = document.querySelector('.js-rate');

btnPlay.addEventListener('click', play);
btnPause.addEventListener('click', pause);
rangeRate.addEventListener('input', setPlaybackRate);
toggle.addEventListener('click', togglePlaybackRate);
visual.addEventListener('mousedown', touchDown);
visual.addEventListener('mouseup', touchUp);

let mouseX = 0;
let mouseY = 0;
let mouseMoved;

function throttle(fn, threshhold, scope) {
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

function mouseMoveHandler(e) {
    const MAX = 10;
    const MIN = -MAX;

    let newY = e.offsetY;
    let diffY = mouseY - newY;

    // clamp
    diffY = Math.min(Math.max(diffY, MIN), MAX);

    // test
    diffY = Math.abs(diffY);

    let speed = (diffY / 3);

    console.log(speed);

    if (newY > mouseY && diffY > 1 && !isReversed) {
        isReversed = true;
        play();
    } else if (newY < mouseY && diffY > 1 && isReversed) {
        isReversed = false;
        play();
    } else {
        cancelScheduledPlaybackRate();
        sourcePlaying.playbackRate.linearRampToValueAtTime(speed, audioCtx.currentTime + 0.2);
        sourcePlaying.playbackRate.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    }

    mouseY = newY;
}

let mouseMove = throttle(mouseMoveHandler, 50);

function touchDown(e) {
    sourcePlaying.playbackRate.setValueAtTime(sourcePlaying.playbackRate.value, audioCtx.currentTime);
    sourcePlaying.playbackRate.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);

    mouseX = e.offsetX;
    mouseY = e.offsetY;
    mouseMoved = Date.now();

    visual.addEventListener('mousemove', mouseMove);
}

function touchUp() {
    cancelScheduledPlaybackRate();

    sourcePlaying.playbackRate.setValueAtTime(sourcePlaying.playbackRate.value, audioCtx.currentTime);
    sourcePlaying.playbackRate.linearRampToValueAtTime(absolutePlaybackRate, audioCtx.currentTime + 0.2);

    visual.removeEventListener('mousemove', mouseMove);
}

function togglePlaybackRate() {
    pb = parseFloat(playbackRate) === 1 ? -1 : 1;
    rangeRate.value = pb;

    setPlaybackRate();
}

function resetPlaybackRate() {
    cancelScheduledPlaybackRate();

    rangeRate.value = 1;
    setPlaybackRate();
}

function cancelScheduledPlaybackRate() {
    sourcePlaying.playbackRate.cancelScheduledValues(audioCtx.currentTime);
}

function setPlaybackRate(e) {
    cancelScheduledPlaybackRate();

    // https://developer.mozilla.org/en-US/docs/Web/API/AudioParam
    playbackRate = rangeRate.value;
    absolutePlaybackRate = Math.abs(playbackRate);

    if (playbackRate !== previousPlaybackRate && playbackRate < 0 && !isReversed) {
        isReversed = true;
        play();
    } else if (playbackRate !== previousPlaybackRate && playbackRate > 0 && isReversed) {
        isReversed = false;
        play();
    } else {
        sourcePlaying.playbackRate.linearRampToValueAtTime(absolutePlaybackRate, audioCtx.currentTime + 1);
    }

    previousPlaybackRate = playbackRate;
}

function pause() {
    cancelScheduledPlaybackRate();

    sourcePlaying.playbackRate.setValueAtTime(0, audioCtx.currentTime);

    isPaused = true;

    btnPause.disabled = true;
    btnPlay.disabled = false;
}

function stop() {
    cancelScheduledPlaybackRate();

    sourcePlaying.stop(0);

    isPaused = false;
    isStarted = false;

    btnPause.disabled = true;
    btnPlay.disabled = false;
}

let isStarted = false;
let startUp = false;

let timePlayingMS = 0;
let timestamp;

function play() {

    audioOffset = 0;

    if (!isStarted) {
        timePlayingMS = 0;
        startUp = true;
    } else {
        sourcePlaying.stop(0);
    }

    let startTime = timePlayingMS / 1000;

    if (isReversed) {
        startTime = soundDuration - startTime;
    }

    setSource();

    isPaused = false;
    sourcePlaying.start(0, startTime);

    if (startUp) {
        startUp = false;
        sourcePlaying.playbackRate.setValueAtTime(0, audioCtx.currentTime);
        sourcePlaying.playbackRate.linearRampToValueAtTime(absolutePlaybackRate, audioCtx.currentTime + 1);
    }

    isStarted = true;
    timestamp = performance.now();

    btnPause.disabled = false;
    btnPlay.disabled = true;
}

function setSource() {
    createSources(globalSourceBuffer);

    sourcePlaying = isReversed ? sourceBackwards : sourceForwards;

    sourcePlaying.playbackRate.setValueAtTime(absolutePlaybackRate, audioCtx.currentTime)
}

function timer() {
    if (isStarted && !isPaused) {
        let now = performance.now();
        let diff = now - timestamp;
        let playbackRate = sourcePlaying.playbackRate.value;

        if (isReversed) {
            playbackRate *= -1;
        }

        diff *= playbackRate;

        timePlayingMS += diff;

        output.innerHTML = `${playbackRate}x, ${Math.round(timePlayingMS) / 1000}s, ${timePlayingMS}MS`;
        timestamp = now;

        if ((timePlayingMS / 1000 >= soundDuration) || (isReversed && timePlayingMS <= 0)) {
            stop();
        }
    }

    requestAnimationFrame(timer);
}

let rafId = requestAnimationFrame(timer);



/*
// MUSIC DISPLAY
function displayBuffer(buff) {

  var drawLines = 500;
   var leftChannel = buff.getChannelData(0); // Float32Array describing left channel
   var lineOpacity = canvasWidth / leftChannel.length  ;
   context.save();
   context.fillStyle = '#080808' ;
   context.fillRect(0,0,canvasWidth,canvasHeight );
   context.strokeStyle = '#46a0ba';
   context.globalCompositeOperation = 'lighter';
   context.translate(0,canvasHeight / 2);
   //context.globalAlpha = 0.6 ; // lineOpacity ;
   context.lineWidth=1;
   var totallength = leftChannel.length;
   var eachBlock = Math.floor(totallength / drawLines);
   var lineGap = (canvasWidth/drawLines);

  context.beginPath();
   for(var i=0;i<=drawLines;i++){
      var audioBuffKey = Math.floor(eachBlock * i);
       var x = i*lineGap;
       var y = leftChannel[audioBuffKey] * canvasHeight / 2;
       context.moveTo( x, y );
       context.lineTo( x, (y*-1) );
   }
   context.stroke();
   context.restore();
}
*/