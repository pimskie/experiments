# Modern Audio Effects Mixer

A modern ES6 rewrite of the original Backbone.js audio effects mixer, built without external dependencies.

## Features

- **Audio Effects**: Add delay and bass filter effects
- **Visual Connections**: Connect audio components with drag-and-drop connections
- **Real-time Controls**: Adjust effect parameters with sliders
- **Drag & Drop**: Move components around the interface
- **Web Audio API**: Modern browser audio processing

## Architecture

### Components

- **SoundComponent**: Audio source (plays ring_of_fire.mp3)
- **MasterComponent**: Volume control and final output
- **DelayComponent**: Audio delay effect with time and volume controls
- **BassComponent**: High-pass and low-pass filter combination
- **ControlsComponent**: UI to add new effect components

### Managers

- **ConnectionManager**: Handles visual connections between components
- **DragManager**: Manages drag and drop functionality

### Utilities

- **dom.js**: DOM manipulation utilities (replaces jQuery)

## Usage

1. Open `index.html` in a modern browser
2. Click anywhere to start audio playback (browser autoplay policy)
3. Use "Add Effects" to add delay or bass components
4. Drag components around by their drag handles
5. Connect components by clicking input/output circles
6. Adjust sliders to control effect parameters
7. Remove components with the × button

## Technical Details

### Modern JavaScript Features Used

- ES6 Classes
- Arrow Functions
- Template Literals
- Destructuring
- Spread Operator
- Map/Set
- Modules (import/export)
- Async/Await ready

### Browser APIs Used

- Web Audio API
- Canvas API
- DOM APIs
- Event APIs

### No External Dependencies

- No jQuery
- No Backbone.js
- No Underscore.js
- No RequireJS
- Pure vanilla JavaScript

## File Structure

```
modern/
├── index.html              # Main HTML file
├── test.html              # Test page with instructions
├── styles.css             # Modern CSS styles
├── README.md              # This file
├── js/
│   ├── main.js            # Application entry point
│   ├── app.js             # Main application class
│   ├── components/        # Audio effect components
│   │   ├── BaseComponent.js
│   │   ├── SoundComponent.js
│   │   ├── MasterComponent.js
│   │   ├── DelayComponent.js
│   │   ├── BassComponent.js
│   │   └── ControlsComponent.js
│   ├── managers/          # System managers
│   │   ├── ConnectionManager.js
│   │   └── DragManager.js
│   └── utils/             # Utility functions
│       └── dom.js
└── sound/
    └── ring_of_fire.mp3   # Audio file
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Requires modern browser with ES6 module support and Web Audio API.

## Development

To run locally:

```bash
# Start a local server (required for ES6 modules)
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Testing

Open `test.html` for a guided test of all functionality with visual feedback.

