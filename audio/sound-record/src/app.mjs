import SnareDrum from "./samples/snare.mjs";

const DrumMachine = (function () {
  // Private variables
  let audioContext;
  let isRecording = false;
  let recordingStartTime = 0;
  let recordedBeats = [];
  let snare;

  // Initialize audio context
  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    return audioContext;
  }

  // Update recording visualization
  function updateRecordingUI() {
    const visualizer = document.getElementById("recordingVisualizer");

    // Clear current visualization
    visualizer.innerHTML = "";

    // Create a timeline representation
    const duration =
      recordedBeats.length > 0
        ? recordedBeats[recordedBeats.length - 1].time
        : 0;

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

  // Highlight a beat during playback
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

  // Public API
  return {
    // Initialize the drum machine
    init: function () {
      // Initialize audio context
      audioContext = initAudioContext();

      // Initialize the snare drum
      snare = new SnareDrum(audioContext);

      // Setup UI
      this.setupUI();

      return this;
    },

    // Play a specific instrument
    playInstrument: function (type) {
      switch (type) {
        case "snare":
          snare.play();
          break;
        // Add more instruments here in the future
        default:
          console.warn("Unknown instrument type:", type);
      }

      // If recording, store the beat
      if (isRecording) {
        const currentTime = audioContext.currentTime;
        const relativeTime = currentTime - recordingStartTime;

        recordedBeats.push({
          type: type,
          time: relativeTime,
        });

        // Update the UI
        updateRecordingUI();
      }
    },

    // Start recording
    startRecording: function () {
      audioContext = initAudioContext();

      // Reset recording data
      recordedBeats = [];
      recordingStartTime = audioContext.currentTime;
      isRecording = true;

      // Update UI
      const recordButton = document.getElementById("recordButton");
      const playbackButton = document.getElementById("playbackButton");

      if (recordButton) {
        recordButton.textContent = "Stop Recording";
        recordButton.classList.add("recording");
      }

      if (playbackButton) {
        playbackButton.disabled = true;
      }

      // Clear recording visualization
      const visualizer = document.getElementById("recordingVisualizer");
      if (visualizer) {
        visualizer.innerHTML = "";
        visualizer.style.display = "block";
      }
    },

    // Stop recording
    stopRecording: function () {
      isRecording = false;

      // Update UI
      const recordButton = document.getElementById("recordButton");
      const playbackButton = document.getElementById("playbackButton");

      if (recordButton) {
        recordButton.textContent = "Record";
        recordButton.classList.remove("recording");
      }

      if (playbackButton) {
        playbackButton.disabled = false;
      }

      // Sort recorded beats by time
      recordedBeats.sort((a, b) => a.time - b.time);

      console.log("Recorded beats:", recordedBeats);
    },

    // Toggle recording state
    toggleRecording: function () {
      if (isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },

    // Play back the recorded sequence
    // Play back the recorded sequence
    playbackRecording: function () {
      audioContext = initAudioContext();

      if (recordedBeats.length === 0) {
        alert("No beats recorded yet!");
        return;
      }

      // Disable buttons during playback
      const playbackButton = document.getElementById("playbackButton");
      const recordButton = document.getElementById("recordButton");

      if (playbackButton) playbackButton.disabled = true;
      if (recordButton) recordButton.disabled = true;

      // Start time for playback
      const startTime = audioContext.currentTime;

      // Schedule all beats
      recordedBeats.forEach((beat) => {
        // Schedule this beat at the appropriate time
        switch (beat.type) {
          case "snare":
            // Fix: Pass an options object with the time parameter
            snare.play({
              time: startTime + beat.time,
            });
            break;
          // Add more instrument types here
        }

        // Visual feedback during playback
        setTimeout(() => {
          highlightBeat(beat);
        }, beat.time * 1000);
      });

      // Calculate total duration of the recording
      const lastBeatTime =
        recordedBeats.length > 0
          ? recordedBeats[recordedBeats.length - 1].time
          : 0;

      // Re-enable buttons after playback finishes
      setTimeout(() => {
        if (playbackButton) playbackButton.disabled = false;
        if (recordButton) recordButton.disabled = false;
      }, (lastBeatTime + 0.5) * 1000);
    },

    // Set up the UI
    setupUI: function () {
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

      const self = this;
      snareButton.addEventListener("click", function () {
        self.playInstrument("snare");
      });

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
      recordButton.addEventListener("click", function () {
        self.toggleRecording();
      });

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
      playbackButton.addEventListener("click", function () {
        self.playbackRecording();
      });

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

      // Add keyboard support
      document.addEventListener("keydown", (event) => {
        // Space bar plays snare
        if (event.code === "Space") {
          event.preventDefault(); // Prevent page scrolling
          this.playInstrument("snare");
          snareButton.style.transform = "scale(0.95)";
          snareButton.style.backgroundColor = "#ff1a1a";
        }

        // R key toggles recording
        if (event.code === "KeyR") {
          this.toggleRecording();
        }

        // P key plays back recording
        if (event.code === "KeyP" && !playbackButton.disabled) {
          this.playbackRecording();
        }
      });

      document.addEventListener("keyup", (event) => {
        if (event.code === "Space") {
          snareButton.style.transform = "scale(1)";
          snareButton.style.backgroundColor = "#ff5252";
        }
      });
    },
  };
})();

// Initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the drum machine
  DrumMachine.init();
});

