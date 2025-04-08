/**
 * Main application
 */
import { createElement } from "./utils/dom.js";
import DrumPad from "./components/DrumPad.js";
import TransportControls from "./components/TransportControls.js";
import RecordingVisualizer from "./components/RecordingVisualizer.js";
import InstrumentRegistry from "./instruments/InstrumentRegistry.js";
import recordingService from "./services/RecordingService.js";
import useAudioContext from "./hooks/useAudioContext.js";

class DrumMachineApp {
  constructor() {
    this.container = null;
    this.instruments = new Map();
    this.transportControls = null;
    this.visualizer = null;
    this.keyboardHandlers = new Map();

    // Initialize audio context
    this.context = useAudioContext();
    recordingService.setAudioContext(this.context);
  }

  /**
   * Initialize the application
   */
  init() {
    // Create main container
    this.container = createElement("div", {
      className: "container",
      id: "drumMachineControls",
    });

    // Add title
    const title = createElement(
      "h2",
      {
        className: "title",
      },
      "Drum Machine"
    );

    this.container.appendChild(title);

    // Create drum pad section
    this.renderDrumPads();

    // Create transport controls
    this.transportControls = new TransportControls(() =>
      this.playbackRecording()
    );
    this.transportControls.render(this.container);

    // Create visualizer
    this.visualizer = new RecordingVisualizer();
    this.visualizer.render(this.container);

    // Add to document
    document.body.appendChild(this.container);

    // Add keyboard handlers
    this.setupKeyboardHandlers();

    return this;
  }

  /**
   * Render all drum pads
   */
  renderDrumPads() {
    const drumPadSection = createElement("div", {
      className: "drum-pad-section",
    });

    // Get available instruments
    const availableInstruments = InstrumentRegistry.getAvailableInstruments();

    // Create a drum pad for each instrument
    availableInstruments.forEach((type) => {
      const drumPad = new DrumPad(type, (instrumentType) =>
        this.handleInstrumentPlayed(instrumentType)
      );
      drumPad.render(drumPadSection);
      this.instruments.set(type, drumPad);
    });

    this.container.appendChild(drumPadSection);
  }

  /**
   * Set up keyboard handlers
   */
  setupKeyboardHandlers() {
    // Space bar plays snare
    this.addKeyboardHandler("Space", () => {
      if (this.instruments.has("snare")) {
        this.instruments.get("snare").play();
      }
    });

    // R key toggles recording
    this.addKeyboardHandler("KeyR", () => {
      recordingService.toggleRecording();
    });

    // P key plays back recording
    this.addKeyboardHandler("KeyP", () => {
      if (!recordingService.getIsRecording()) {
        this.playbackRecording();
      }
    });

    // Add the event listeners
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  /**
   * Add a keyboard handler
   * @param {string} code - Key code
   * @param {Function} handler - Handler function
   */
  addKeyboardHandler(code, handler) {
    this.keyboardHandlers.set(code, handler);
  }

  /**
   * Handle key down event
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    if (this.keyboardHandlers.has(event.code)) {
      // Prevent default for space to avoid page scrolling
      if (event.code === "Space") {
        event.preventDefault();
      }

      this.keyboardHandlers.get(event.code)();
    }
  }

  /**
   * Handle key up event
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyUp(event) {
    // Handle key up events if needed
  }

  /**
   * Handle instrument played
   * @param {string} type - Instrument type
   */
  handleInstrumentPlayed(type) {
    // This is called when an instrument is played
    // Additional logic can be added here if needed
  }

  /**
   * Play back the recorded sequence
   */
  async playbackRecording() {
    try {
      await recordingService.playbackRecording((type, time) => {
        if (this.instruments.has(type)) {
          this.instruments.get(type).playAt(time);
        }
      });
    } catch (error) {
      console.error("Playback error:", error);
      alert(error.message);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clean up components
    if (this.transportControls) {
      this.transportControls.destroy();
    }

    if (this.visualizer) {
      this.visualizer.destroy();
    }

    // Remove keyboard handlers
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }
}

export default DrumMachineApp;
