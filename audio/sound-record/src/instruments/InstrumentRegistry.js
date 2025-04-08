/**
 * Registry of available instruments
 */
import SnareDrum from "../samples/SnareDrum.mjs";
import KickDrum from "../samples/KickDrum.mjs";

// Map of instrument types to their classes
const instrumentClasses = {
	snare: SnareDrum,
	kick: KickDrum,
};

// Map of instrument types to their instances
const instrumentInstances = new Map();

/**
 * Get or create an instrument instance
 * @param {string} type - Instrument type
 * @param {AudioContext} context - Audio context
 * @returns {Object} - Instrument instance
 */
export const getInstrument = (type, context) => {
	if (!instrumentClasses[type]) {
		throw new Error(`Unknown instrument type: ${type}`);
	}

	// Create a key that includes the context
	const key = `${type}-${context.id || "default"}`;

	if (!instrumentInstances.has(key)) {
		const InstrumentClass = instrumentClasses[type];
		instrumentInstances.set(key, new InstrumentClass(context));
	}

	return instrumentInstances.get(key);
};

/**
 * Get all available instrument types
 * @returns {Array} - Array of instrument type strings
 */
export const getAvailableInstruments = () => {
	return Object.keys(instrumentClasses);
};

/**
 * Get instrument color
 * @param {string} type - Instrument type
 * @returns {string} - CSS color class
 */
// export const getInstrumentColor = (type) => {
// 	const colorMap = {
// 		snare: "var(--color-instrument-snare)",
// 		kick: "var(--color-instrument-kick)",
// 	};

// 	return colorMap[type] || "red";
// };

/**
 * Get instrument display name
 * @param {string} type - Instrument type
 * @returns {string} - Display name
 */
export const getInstrumentName = (type) => {
	const nameMap = {
		snare: "Snare",
	};

	return nameMap[type] || type;
};

export default {
	getInstrument,
	getAvailableInstruments,
	getInstrumentName,
};

