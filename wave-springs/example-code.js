const leftDeltas = [];
	const rightDeltas = [];

	for (let i = 0; i < springs.length; i++) {
		if (i > 0) {
			leftDeltas[i] = waveSpread * (springs[i].height - springs[i - 1].height);
			springs[i - 1].acceleration += leftDeltas[i];
		}

		if (i < springs.length - 1) {
			rightDeltas[i] = waveSpread * (springs[i].height - springs[i + 1].height);
			springs[i + 1].acceleration += rightDeltas[i];
		}
	}

	for (let i = 0; i < springs.length; i++) {
		if (i > 0) {
			springs[i - 1].height += leftDeltas[i];
		}

		if (i < springs.length - 1) {
			springs[i + 1].height += rightDeltas[i];
		}
	}
