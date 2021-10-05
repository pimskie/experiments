const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

const getFlipperTemplate = (numFront, numBack) => `
	<div class="flipper">
		<div class="front">
			<div class="number">${numFront}</div>
		</div>

		<div class="back">
			<div class="number">${numBack}</div>
		</div>
	</div>
`;

const getFlippers = (numCurrent, numMax, canBeZero = false) => {
	const numComplete = `${numCurrent}`.padStart(2, '0');
	const numCompleteNext = numCurrent === numMax
		? canBeZero ? '00' : '01'
		: `${numCurrent + 1}`.padStart(2, '0');

	return getFlipperTemplate(numComplete, numCompleteNext);
};

const hoursContainer = qs('.js-hours');
const minutesContainer = qs('.js-minutes');

const hourButton = qs('.js-hour-button');
const minuteButton = qs('.js-minute-button');

hoursContainer.innerHTML = new Array(12)
	.fill()
	.map((_, index) => getFlippers(index + 1, 12))
	.reverse()
	.join('');

minutesContainer.innerHTML = new Array(60)
	.fill()
	.map((_, index) => getFlippers(index, 59, true))
	.reverse()
	.join('');

const rotateFlipper = (e) => {
	const { target: currentFlipped } = e;
	const { parentNode: flipperParent } = currentFlipped;

	currentFlipped.removeEventListener('transitionend', rotateFlipper);

	const previousFlipped = flipperParent.querySelector('.is-flipped:last-child');

	if (currentFlipped === previousFlipped) {
		return;
	}

	previousFlipped.classList.remove('is-flipped');

	flipperParent.prepend(previousFlipped);
};

const flipClockPart = (part) => {
	const [flipper] = [...part.querySelectorAll('.flipper:not(.is-flipped)')].reverse();

	flipper.addEventListener('transitionend', rotateFlipper);

	flipper.classList.add('is-flipped');
};

hourButton.addEventListener('click', () => flipClockPart(hoursContainer));
minuteButton.addEventListener('click', () => flipClockPart(minutesContainer));
