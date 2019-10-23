const hsvToHsl = ({ h, s, v }) => {
	// both hsv and hsl values are in [0, 1]
	var l = (2 - s) * v / 2;

	if (l != 0) {
		if (l == 1) {
			s = 0;
		} else if (l < 0.5) {
			s = s * v / (l * 2);
		} else {
			s = s * v / (2 - l * 2);
		}
	}

	return { h, s, l };
}

export default hsvToHsl;
