// [motorMax, scratchMultiply] - duration sec
// [3, 30] - 100

const times = {
	motorOn: 0.05,
	motorOff: -0.05,

	// changing motor speed changes scratch effect.
	// Change scratchMultiply too
	motorMax: 3,
	scratchMultiply: 30,

	powerOff: -0.005,
	scratchRamp: 0.1,
	sampleTime: 2
};

export default times;
