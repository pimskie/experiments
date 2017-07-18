var playButton = document.querySelector('button');

// Create AudioContext and buffer source
var audioCtx = new AudioContext();
source = audioCtx.createBufferSource();

var bufferSize = 4096;

/**
 * ticking sound
 */
/*
var effect = (function () {
	var node = audioCtx.createScriptProcessor(bufferSize, 1, 1);

	node.onaudioprocess = function (e) {
		let input = e.inputBuffer.getChannelData(0);
		let output = e.outputBuffer.getChannelData(0);

		for (let i = 0; i < input.length; i++) {
			output[i] = input[i];


			if (i % input.length * 0.5 === 0) {
				output[i] += ((Math.random() * 2) - 1) * 0.2;
			}
		}
	}
	return node;

})();
*/

/**
 * White noise
 */
/*
var effect = (function () {
	var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    var node = audioCtx.createScriptProcessor(bufferSize, 1, 1);

    node.onaudioprocess = function (e) {
		let input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);

        for (var i = 0; i < bufferSize; i++) {
            var white = (Math.random() * 2 - 1) * 0.02;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

			output[i] = input[i];

			let pinkNoise = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			output[i] += pinkNoise;

            output[i] *= 0.11; // (roughly) compensate for gain

			b6 = white * 0.115926;
        }
    }
	return node;

})();
*/

/**
 * Brown noise, AKA heavy distortion
 */
/*
var effect = (function () {
	var node = audioCtx.createScriptProcessor(bufferSize, 1, 1);
	var lastOut = 0.0;

	node.onaudioprocess = function (e) {
		let input = e.inputBuffer.getChannelData(0);
		let output = e.outputBuffer.getChannelData(0);

		for (var i = 0; i < bufferSize; i++) {
			output[i] = input[i];

            var white = (Math.random() * 2 - 1) * 0.001;
			var noise = (lastOut + (0.02 * white)) / 1.02;
            output[i] += noise;

            lastOut = output[i];
            output[i] *= 2.5; // (roughly) compensate for gain
        }
	}

	return node;

})();
*/


var effect = (function () {
	var node = audioCtx.createScriptProcessor(bufferSize, 1, 1);

	var in1, in2, in3, in4, out1, out2, out3, out4;
    in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
    node.cutoff = 0.065; // between 0.0 and 1.0
    node.resonance = 3.99; // between 0.0 and 4.0

    node.onaudioprocess = function (e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        var f = node.cutoff * 1.16;
        var fb = node.resonance * (1.0 - 0.15 * f * f);
        for (var i = 0; i < bufferSize; i++) {
            input[i] -= out4 * fb;
            input[i] *= 0.35013 * (f * f) * (f * f);
            out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
            in1 = input[i];
            out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
            in2 = out1;
            out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
            in3 = out2;
            out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
            in4 = out3;
            output[i] = out4;
        }
    }

	return node;

})();

function getData() {
	request = new XMLHttpRequest();
	request.open('GET', 'http://mdn.github.io/script-processor-node/viper.ogg', true);
	request.responseType = 'arraybuffer';
	request.onload = function () {
		var audioData = request.response;

		audioCtx.decodeAudioData(audioData, function (buffer) {
			myBuffer = buffer;
			source.buffer = myBuffer;
        },
			function (e) { "Error with decoding audio data" + e.err });
	}
	request.send();
}

// // Give the node a function to process audio events
// scriptNode.onaudioprocess = function (audioProcessingEvent) {
// 	// The input buffer is the song we loaded earlier
// 	var inputBuffer = audioProcessingEvent.inputBuffer;

// 	// The output buffer contains the samples that will be modified and played
// 	var outputBuffer = audioProcessingEvent.outputBuffer;

// 	// Loop through the output channels (in this case there is only one)
// 	for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
// 		var inputData = inputBuffer.getChannelData(channel);
// 		var outputData = outputBuffer.getChannelData(channel);

// 		// Loop through the 4096 samples
// 		for (var sample = 0; sample < inputBuffer.length; sample++) {

// 			if (sample % 20 === 0) {
// 				// make output equal to the same as the input
// 				outputData[sample] = inputData[sample];

// 				// add noise to each output sample
// 				outputData[sample] += ((Math.random() * 2) - 1) * 0.2;
// 			}

// 		}
// 	}
// }

getData();

// wire up play button
playButton.onclick = function () {
	source.connect(effect);
	effect.connect(audioCtx.destination);

	// source.connect(audioCtx.destination);
	source.start();
}

// When the buffer source stops playing, disconnect everything
source.onended = function () {
	source.disconnect(scriptNode);
	scriptNode.disconnect(audioCtx.destination);
}