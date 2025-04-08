// Initialize audio context and recording variables
let audioContext;
let isRecording = false;
let recordingStartTime = 0;
let recordedBeats = [];

// Initialize on first user interaction
document.addEventListener("click", function initAudio() {
	if (!audioContext) {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
		document.removeEventListener("click", initAudio);
	}
});

// Function to create noise buffer
function createNoiseBuffer() {
	const bufferSize = audioContext.sampleRate * 2;
	const buffer = audioContext.createBuffer(
		1,
		bufferSize,
		audioContext.sampleRate
	);
	const output = buffer.getChannelData(0);

	// Improved noise generation for more natural sound
	let b0, b1, b2, b3, b4, b5, b6;
	b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

	for (let i = 0; i < bufferSize; i++) {
		const white = Math.random() * 2 - 1;

		// Pink noise filter (gives more natural sound than pure white noise)
		b0 = 0.99886 * b0 + white * 0.0555179;
		b1 = 0.99332 * b1 + white * 0.0750759;
		b2 = 0.969 * b2 + white * 0.153852;
		b3 = 0.8665 * b3 + white * 0.3104856;
		b4 = 0.55 * b4 + white * 0.5329522;
		b5 = -0.7616 * b5 - white * 0.016898;
		output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
		output[i] *= 0.11; // Normalize to roughly unit volume
		b6 = white * 0.115926;
	}

	return buffer;
}

// Main function to play snare drum
function playRealisticSnare(timeOffset = 0) {
	if (!audioContext) {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
	}

	// If timeOffset is provided, use it (for playback), otherwise use current time (for live play)
	const now = timeOffset ? timeOffset : audioContext.currentTime;

	// === Main output chain ===
	const mainCompressor = audioContext.createDynamicsCompressor();
	mainCompressor.threshold.setValueAtTime(-24, now);
	mainCompressor.knee.setValueAtTime(4, now);
	mainCompressor.ratio.setValueAtTime(12, now);
	mainCompressor.attack.setValueAtTime(0.002, now);
	mainCompressor.release.setValueAtTime(0.25, now);
	mainCompressor.connect(audioContext.destination);

	// === Drum body resonance (deeper sound) ===
	// Multiple oscillators for richer harmonics
	const oscFreqs = [150, 180, 220];
	const oscGain = audioContext.createGain();
	oscGain.gain.setValueAtTime(0.7, now);
	oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
	oscGain.connect(mainCompressor);

	oscFreqs.forEach((freq, i) => {
		const osc = audioContext.createOscillator();
		osc.type = i === 0 ? "sine" : i === 1 ? "triangle" : "sawtooth";
		osc.frequency.setValueAtTime(freq, now);
		osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.08);

		const oscIndividualGain = audioContext.createGain();
		oscIndividualGain.gain.value = i === 0 ? 1.0 : i === 1 ? 0.5 : 0.2;

		osc.connect(oscIndividualGain);
		oscIndividualGain.connect(oscGain);

		osc.start(now);
		osc.stop(now + 0.3);
	});

	// === Drum shell resonance (mid frequencies) ===
	const shellOsc = audioContext.createOscillator();
	shellOsc.type = "triangle";
	shellOsc.frequency.setValueAtTime(330, now);
	shellOsc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

	const shellGain = audioContext.createGain();
	shellGain.gain.setValueAtTime(0.3, now);
	shellGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

	shellOsc.connect(shellGain);
	shellGain.connect(mainCompressor);

	shellOsc.start(now);
	shellOsc.stop(now + 0.2);

	// === Snare wire rattle (high frequencies) ===
	const noiseBuffer = createNoiseBuffer();
	const noiseSource = audioContext.createBufferSource();
	noiseSource.buffer = noiseBuffer;

	// Multi-stage filter for more realistic snare wire sound
	const noiseLowpass = audioContext.createBiquadFilter();
	noiseLowpass.type = "lowpass";
	noiseLowpass.frequency.value = 8000;
	noiseLowpass.Q.value = 0.8;

	const noiseHighpass = audioContext.createBiquadFilter();
	noiseHighpass.type = "highpass";
	noiseHighpass.frequency.value = 2000;
	noiseHighpass.Q.value = 0.75;

	// Peaking EQ to emphasize snare wire frequencies
	const noisePeak = audioContext.createBiquadFilter();
	noisePeak.type = "peaking";
	noisePeak.frequency.value = 4500;
	noisePeak.Q.value = 2.5;
	noisePeak.gain.value = 15;

	// Noise envelope
	const noiseEnvelope = audioContext.createGain();
	noiseEnvelope.gain.setValueAtTime(1.0, now);
	noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

	// Connect noise chain
	noiseSource.connect(noiseLowpass);
	noiseLowpass.connect(noiseHighpass);
	noiseHighpass.connect(noisePeak);
	noisePeak.connect(noiseEnvelope);
	noiseEnvelope.connect(mainCompressor);

	noiseSource.start(now);
	noiseSource.stop(now + 0.3);

	// === Initial attack transient ===
	const attackOsc = audioContext.createOscillator();
	attackOsc.type = "triangle";
	attackOsc.frequency.setValueAtTime(250, now);
	attackOsc.frequency.exponentialRampToValueAtTime(80, now + 0.02);

	const attackGain = audioContext.createGain();
	attackGain.gain.setValueAtTime(0.6, now);
	attackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

	attackOsc.connect(attackGain);
	attackGain.connect(mainCompressor);

	attackOsc.start(now);
	attackOsc.stop(now + 0.05);

	// === Room simulation for depth ===
	const convolver = audioContext.createConvolver();

	// Create a simple room impulse response
	const impulseLength = audioContext.sampleRate * 1.5; // 1.5 seconds
	const impulse = audioContext.createBuffer(
		2,
		impulseLength,
		audioContext.sampleRate
	);
	const impulseL = impulse.getChannelData(0);
	const impulseR = impulse.getChannelData(1);

	// Create room impulse response
	for (let i = 0; i < impulseLength; i++) {
		// Exponential decay for room reverb
		const decay = Math.exp(-i / (audioContext.sampleRate * 0.3));
		// Add some randomness for a more natural sound
		impulseL[i] = (Math.random() * 2 - 1) * decay * 0.05;
		impulseR[i] = (Math.random() * 2 - 1) * decay * 0.05;
	}

	convolver.buffer = impulse;

	// Room mix
	const dryGain = audioContext.createGain();
	dryGain.gain.value = 0.7;
	mainCompressor.connect(dryGain);
	dryGain.connect(audioContext.destination);

	const wetGain = audioContext.createGain();
	wetGain.gain.value = 0.3;
	mainCompressor.connect(convolver);
	convolver.connect(wetGain);
	wetGain.connect(audioContext.destination);

	// === Subtle distortion for warmth ===
	const distortion = audioContext.createWaveShaper();
	function makeDistortionCurve(amount) {
		const k = amount || 10;
		const samples = 44100;
		const curve = new Float32Array(samples);
		const deg = Math.PI / 180;

		for (let i = 0; i < samples; i++) {
			const x = (i * 2) / samples - 1;
			// Subtle tube-like distortion
			curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
		}
		return curve;
	}

	distortion.curve = makeDistortionCurve(5);
	distortion.oversample = "4x";

	// Insert distortion in the chain
	const distortionGain = audioContext.createGain();
	distortionGain.gain.value = 0.2;

	mainCompressor.connect(distortion);
	distortion.connect(distortionGain);
	distortionGain.connect(audioContext.destination);
}

// Function to trigger the snare (for UI button)
function playSnare() {
	// Play the snare immediately
	playRealisticSnare();

	// If we're recording, store the timing information
	if (isRecording) {
		const currentTime = audioContext.currentTime;
		const relativeTime = currentTime - recordingStartTime;
		recordedBeats.push({
			type: "snare",
			time: relativeTime,
		});

		// Update the UI to show recorded beat
		updateRecordingUI();
	}
}

// Function to start recording
function startRecording() {
	if (!audioContext) {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
	}

	// Reset recording data
	recordedBeats = [];
	recordingStartTime = audioContext.currentTime;
	isRecording = true;

	// Update UI
	document.getElementById("recordButton").textContent = "Stop Recording";
	document.getElementById("recordButton").classList.add("recording");
	document.getElementById("playbackButton").disabled = true;

	// Clear recording visualization
	const visualizer = document.getElementById("recordingVisualizer");
	visualizer.innerHTML = "";
	visualizer.style.display = "block";
}

// Function to stop recording
function stopRecording() {
	isRecording = false;

	// Update UI
	document.getElementById("recordButton").textContent = "Record";
	document.getElementById("recordButton").classList.remove("recording");
	document.getElementById("playbackButton").disabled = false;

	// Sort recorded beats by time (just in case)
	recordedBeats.sort((a, b) => a.time - b.time);

	// Log what was recorded (for debugging)
	console.log("Recorded beats:", recordedBeats);
}

// Function to toggle recording state
function toggleRecording() {
	if (isRecording) {
		stopRecording();
	} else {
		startRecording();
	}
}

// Function to play back the recorded sequence
function playbackRecording() {
	if (!audioContext) {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
	}

	if (recordedBeats.length === 0) {
		alert("No beats recorded yet!");
		return;
	}

	// Disable buttons during playback
	document.getElementById("playbackButton").disabled = true;
	document.getElementById("recordButton").disabled = true;

	// Start time for playback
	const startTime = audioContext.currentTime;

	// Schedule all beats
	recordedBeats.forEach((beat) => {
		if (beat.type === "snare") {
			// Schedule this beat at the appropriate time
			playRealisticSnare(startTime + beat.time);

			// Visual feedback during playback
			setTimeout(() => {
				highlightBeat(beat);
			}, beat.time * 1000);
		}
		// (Future: add more instrument types here)
	});

	// Calculate total duration of the recording
	const lastBeatTime =
		recordedBeats.length > 0 ? recordedBeats[recordedBeats.length - 1].time : 0;

	// Re-enable buttons after playback finishes
	setTimeout(() => {
		document.getElementById("playbackButton").disabled = false;
		document.getElementById("recordButton").disabled = false;
	}, (lastBeatTime + 0.5) * 1000); // Add a small buffer
}

// Function to update the recording visualization
function updateRecordingUI() {
	const visualizer = document.getElementById("recordingVisualizer");

	// Clear current visualization
	visualizer.innerHTML = "";

	// Create a timeline representation
	const duration =
		recordedBeats.length > 0 ? recordedBeats[recordedBeats.length - 1].time : 0;

	// Create timeline container
	const timeline = document.createElement("div");
	timeline.className = "timeline";
	timeline.style.width = "100%";
	timeline.style.height = "50px";
	timeline.style.position = "relative";
	timeline.style.backgroundColor = "#f0f0f0";
	timeline.style.borderRadius = "5px";
	timeline.style.marginTop = "10px";

	// Add beats to timeline
	recordedBeats.forEach((beat, index) => {
		const beatMarker = document.createElement("div");
		beatMarker.className = "beat-marker";
		beatMarker.id = `beat-${index}`;
		beatMarker.style.position = "absolute";
		beatMarker.style.left = `${(beat.time / (duration + 1)) * 100}%`;
		beatMarker.style.top = "5px";
		beatMarker.style.width = "10px";
		beatMarker.style.height = "40px";
		beatMarker.style.backgroundColor =
			beat.type === "snare" ? "#ff5252" : "#4caf50";
		beatMarker.style.borderRadius = "2px";
		beatMarker.style.transition = "transform 0.1s, opacity 0.1s";

		timeline.appendChild(beatMarker);
	});

	visualizer.appendChild(timeline);
}

// Function to highlight a beat during playback
function highlightBeat(beat) {
	const index = recordedBeats.indexOf(beat);
	const beatElement = document.getElementById(`beat-${index}`);

	if (beatElement) {
		// Flash effect
		beatElement.style.transform = "scaleY(1.2)";
		beatElement.style.opacity = "1";

		setTimeout(() => {
			beatElement.style.transform = "scaleY(1)";
			beatElement.style.opacity = "0.8";
		}, 100);
	}
}

// Function to set up the UI (call this when the page loads)
function setupDrumMachineUI() {
	// Create container for controls if it doesn't exist
	let controlsContainer = document.getElementById("drumMachineControls");
	if (!controlsContainer) {
		controlsContainer = document.createElement("div");
		controlsContainer.id = "drumMachineControls";
		controlsContainer.style.display = "flex";
		controlsContainer.style.flexDirection = "column";
		controlsContainer.style.gap = "15px";
		controlsContainer.style.padding = "20px";
		controlsContainer.style.backgroundColor = "#fff";
		controlsContainer.style.borderRadius = "10px";
		controlsContainer.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
		controlsContainer.style.maxWidth = "600px";
		controlsContainer.style.margin = "20px auto";
		document.body.appendChild(controlsContainer);
	}

	// Add title
	const title = document.createElement("h2");
	title.textContent = "Drum Machine";
	title.style.textAlign = "center";
	title.style.marginTop = "0";
	controlsContainer.appendChild(title);

	// Create drum pad section
	const drumPadSection = document.createElement("div");
	drumPadSection.style.display = "flex";
	drumPadSection.style.justifyContent = "center";
	drumPadSection.style.gap = "10px";

	// Add snare drum button
	const snareButton = document.createElement("button");
	snareButton.id = "playSnare";
	snareButton.textContent = "Play Snare";
	snareButton.style.padding = "20px";
	snareButton.style.borderRadius = "50%";
	snareButton.style.width = "120px";
	snareButton.style.height = "120px";
	snareButton.style.fontSize = "16px";
	snareButton.style.fontWeight = "bold";
	snareButton.style.backgroundColor = "#ff5252";
	snareButton.style.color = "white";
	snareButton.style.border = "none";
	snareButton.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
	snareButton.style.cursor = "pointer";
	snareButton.style.transition = "transform 0.1s, background-color 0.3s";

	snareButton.addEventListener("click", playSnare);
	snareButton.addEventListener("mousedown", () => {
		snareButton.style.transform = "scale(0.95)";
	});
	snareButton.addEventListener("mouseup", () => {
		snareButton.style.transform = "scale(1)";
	});

	drumPadSection.appendChild(snareButton);
	controlsContainer.appendChild(drumPadSection);

	// Create transport controls
	const transportControls = document.createElement("div");
	transportControls.style.display = "flex";
	transportControls.style.justifyContent = "center";
	transportControls.style.gap = "10px";
	transportControls.style.marginTop = "20px";

	// Record button
	const recordButton = document.createElement("button");
	recordButton.id = "recordButton";
	recordButton.textContent = "Record";
	recordButton.style.padding = "10px 20px";
	recordButton.style.borderRadius = "5px";
	recordButton.style.fontSize = "16px";
	recordButton.style.backgroundColor = "#f44336";
	recordButton.style.color = "white";
	recordButton.style.border = "none";
	recordButton.style.cursor = "pointer";
	recordButton.addEventListener("click", toggleRecording);

	// Playback button
	const playbackButton = document.createElement("button");
	playbackButton.id = "playbackButton";
	playbackButton.textContent = "Play Recording";
	playbackButton.style.padding = "10px 20px";
	playbackButton.style.borderRadius = "5px";
	playbackButton.style.fontSize = "16px";
	playbackButton.style.backgroundColor = "#4caf50";
	playbackButton.style.color = "white";
	playbackButton.style.border = "none";
	playbackButton.style.cursor = "pointer";
	playbackButton.disabled = true; // Initially disabled until recording is done
	playbackButton.addEventListener("click", playbackRecording);

	transportControls.appendChild(recordButton);
	transportControls.appendChild(playbackButton);
	controlsContainer.appendChild(transportControls);

	// Add recording visualizer
	const visualizer = document.createElement("div");
	visualizer.id = "recordingVisualizer";
	visualizer.style.width = "100%";
	visualizer.style.minHeight = "70px";
	visualizer.style.marginTop = "20px";
	visualizer.style.display = "none"; // Initially hidden
	controlsContainer.appendChild(visualizer);

	// Add styles for recording button state
	const style = document.createElement("style");
	style.textContent = `
        #recordButton.recording {
            background-color: #b71c1c;
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    `;
	document.head.appendChild(style);

	// Add keyboard support (spacebar for snare)
	document.addEventListener("keydown", (event) => {
		// Space bar plays snare
		if (event.code === "Space") {
			event.preventDefault(); // Prevent page scrolling
			playSnare();
			snareButton.style.transform = "scale(0.95)";
			snareButton.style.backgroundColor = "#ff1a1a";
		}

		// R key toggles recording
		if (event.code === "KeyR") {
			toggleRecording();
		}

		// P key plays back recording
		if (event.code === "KeyP" && !playbackButton.disabled) {
			playbackRecording();
		}
	});

	document.addEventListener("keyup", (event) => {
		if (event.code === "Space") {
			snareButton.style.transform = "scale(1)";
			snareButton.style.backgroundColor = "#ff5252";
		}
	});
}

// Call setup when the page loads
window.addEventListener("DOMContentLoaded", setupDrumMachineUI);
