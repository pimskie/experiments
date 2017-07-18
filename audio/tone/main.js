
(function() {
  'use strict';

  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var TWO_PI = Math.PI * 2,
      TO_RADIAN = Math.PI / 180,
      TO_DEGREE = 180 * Math.PI,
      NUM_TONES = 500,

      canvas = document.getElementById('audio'),
      ctx = canvas.getContext('2d'),
      mousePos = {x: 1337, y: 1337},
      toneWidth = 1,
      spacing = 50,

      soundLoaded = false,
      soundData,
      tones,
      audioCtx,

      windowW,
      windowH;

  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  audioCtx = new AudioContext();
/*
  var stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);*/


  var init = function() {
    windowW = window.innerWidth;
    windowH = window.innerHeight;

    canvas.width = windowW;
    canvas.height = windowH;

    tones = [];
    var i = NUM_TONES,
        incX = toneWidth + spacing,
        incY = toneWidth + spacing,
        x = incX,
        y = incY,
        minFreq = 0,
        maxFreq = 600,
        diffFreq = (maxFreq - minFreq),
        freq;

    while (i--) {
      freq = minFreq +  ((diffFreq / NUM_TONES) * i);
      var t = new Tone(x, y, toneWidth, freq, audioCtx, soundData);
      if (x + incX > canvas.width) {
        x = incX;
        y += incY * 2;
      } else {
        x += incX * 2;
      }
      tones.push(t);
    }
  };


  function randomBetween(min, max, round) {
    var rand = Math.random()*(max-min+1)+min;
    if (round === true) {
      return Math.floor(rand);
    } else {
      return rand;
    }
  }

  var pointerMoveHandler = function(e) {
    mousePos.x = e.x || e.layerX;
    mousePos.y = e.y || e.layerY;
  }


  function Tone(x, y, width, freq, audioContext, soundData) {
    this.x = x;
    this.y = y;
    this.width = width;

    this.isConnected = false;
    this.audio = new Audio(audioContext, soundData);
    this.audio.frequency = freq;
    this.audio.frequencyTo = freq + 100;
  }

  Tone.prototype = {
    draw: function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, TWO_PI, 0, false);
      ctx.fillStyle = '#74CFDA';
      ctx.fill();
      ctx.lineWidth = '1';
      ctx.strokeStyle = '#979EA6';
      ctx.stroke();
      ctx.closePath();
    },

    connect: function (toPos) {
      this.isConnected = true;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
      ctx.closePath();
    },

    disconnect: function () {
      this.isConnected = false;
      // this.audio.stop();
    },


    play: function() {
      if (this.audio.isPlaying === false) {
        this.audio.play();
      }
    },

    distanceTo: function(pos) {
      var dx = pos.x - this.x,
          dy = pos.y - this.y;

      return Math.sqrt(dx * dx + dy * dy);
    }
  }

  function Audio(audioContext, soundData) {
    this.isPlaying = false;
    this.fadeOutId = null;
    this.audioCtx = audioContext;

    this.gainNode = this.audioCtx.createGain();
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = 3;

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(audioCtx.destination);

    this.defaultVolume = 0.2;
    this.frequency = 400;
    this.frequencyTo = 200;
    this.setVolume(0);
    this.oscillator.start(0);
  }

  Audio.prototype = {
    play: function() {
        this.isPlaying = true;

        var now = this.audioCtx.currentTime;
        this.gainNode.gain.setValueAtTime(0, now );
        this.oscillator.frequency.setValueAtTime(this.frequency, now );

        this.oscillator.frequency.exponentialRampToValueAtTime(this.frequencyTo - 150, now + 0.2);
        this.gainNode.gain.linearRampToValueAtTime( this.defaultVolume, now + 0.3 );
        this.gainNode.gain.linearRampToValueAtTime( 0, now + 0.8);

        var me = this;
        setTimeout(function() {
          me.stop();
        }, 1 * 1000);
    },

    stop: function () {
      var now = this.audioCtx.currentTime;
      this.gainNode.gain.linearRampToValueAtTime( 0, now + 1);
      this.isPlaying = false;
    },

    fadeOut: function() {
      var me = this;
      this.fadeOutId = setInterval(function() {
        if (me.getVolume() > 0) {
          me.setVolume(me.getVolume() - 0.05);
        } else {
          me.setVolume(0);
        }

      }, 60);
    },

    setVolume: function(vol) {
      this.gainNode.gain.value = vol;
    },

    getVolume: function() {
      return this.gainNode.gain.value;
    },

    setTone: function(freq) {

    },

    getTone: function() {
      return this.oscillator.frequency.value;
    },
  };



  var loop = function() {
    //stats.begin();
    requestAnimFrame(loop);
    ctx.fillStyle = 'rgba(255,255,255, 0.7)';
    ctx.fillRect(0,0, windowW, windowH);
    ctx.save();

    var i = tones.length,
        tone;
    while (i--) {
      tone = tones[i];
      tone.draw();

      if (tone.distanceTo(mousePos) <= 100) {
        if (tone.isConnected === false) {
          tone.play();
        }
         tone.connect(mousePos);
      } else {
        if (tone.isConnected === true) {
          tone.disconnect();
        }
      }
    }
    ctx.restore();
    //stats.end();
  }

  window.addEventListener('resize', init, false);
  canvas.addEventListener('mousemove', pointerMoveHandler);
  init();
  loop();
})();