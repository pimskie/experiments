const easings = {
	linear: function (t, b, c, d) {
		return (c * t) / d + b;
	},

	easeInQuad: function (t, b, c, d) {
		t /= d;
		return c * t * t + b;
	},

	easeOutQuad: function (t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},

	easeInOutQuad: function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return (c / 2) * t * t + b;
		t--;
		return (-c / 2) * (t * (t - 2) - 1) + b;
	},

	easeInCubic: function (t, b, c, d) {
		t /= d;
		return c * t * t * t + b;
	},

	easeOutCubic: function (t, b, c, d) {
		t /= d;
		t--;
		return c * (t * t * t + 1) + b;
	},

	easeInOutCubic: function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return (c / 2) * t * t * t + b;
		t -= 2;
		return (c / 2) * (t * t * t + 2) + b;
	},

	easeInQuart: function (t, b, c, d) {
		t /= d;
		return c * t * t * t * t + b;
	},

	easeOutQuart: function (t, b, c, d) {
		t /= d;
		t--;
		return -c * (t * t * t * t - 1) + b;
	},

	easeInOutQuart: function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return (c / 2) * t * t * t * t + b;
		t -= 2;
		return (-c / 2) * (t * t * t * t - 2) + b;
	},

	easeInQuint: function (t, b, c, d) {
		t /= d;
		return c * t * t * t * t * t + b;
	},

	easeOutQuint: function (t, b, c, d) {
		t /= d;
		t--;
		return c * (t * t * t * t * t + 1) + b;
	},

	easeInOutQuint: function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return (c / 2) * t * t * t * t * t + b;
		t -= 2;
		return (c / 2) * (t * t * t * t * t + 2) + b;
	},

	easeInSine: function (t, b, c, d) {
		return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
	},

	easeInExpo: function (t, b, c, d) {
		return c * Math.pow(2, 10 * (t / d - 1)) + b;
	},
};

export default easings;
