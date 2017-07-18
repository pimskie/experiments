define([
	'underscore'
],

function(_) {

	return {
		TWO_PI: Math.PI * 2,
		TO_RADIAN: Math.PI / 180,
		TO_DEGREE: 180 / Math.PI,

		randomNumber: function() {
			return new Date().getUTCMilliseconds() + this.randomBetween(0, 1000, true);
		},

		randomBetween: function(min, max, round) {
			var num = Math.random() * (max - min + 1) + min;

			if (round) {
				return Math.floor(num);
			} else {
				return num;
			}
		},

		distanceBetween: function(vector1, vector2) {
			var dx = vector2.x - vector1.x,
				dy = vector2.y - vector1.y;

			return Math.sqrt(dx*dx + dy*dy);
		},

		angleBetween: function(vector1, vector2) {
			return Math.atan2(vector2.y - vector1.y, vector2.x - vector1.x);
		},

		// keep a number within a bound range
		// return min if number < min
		// return max if number > max
		bound: function(value, min, max) {
			return Math.max(Math.min(value, max), min);
		}
	};
});