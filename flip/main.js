const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

const now = new Date();
const hourNow = now.getHours() > 12
	? now.getHours() - 12
	: now.getHours();

const minutesNow = now.getMinutes();

const getFlipperTemplate = (numFront, numBack) => `
	<div class="flipper" data-number="${numFront}">
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

const onTransitionEnd = (e) => {
	const { target: currentFlipped } = e;

	currentFlipped.removeEventListener('transitionend', onTransitionEnd);

	flipFlipper(currentFlipped);
};

const flipFlipper = (currentFlipped) => {
	const { parentNode: flipperParent } = currentFlipped;

	const previousFlipped = flipperParent.querySelector('.is-flipped:last-child');

	if (currentFlipped === previousFlipped || !previousFlipped) {
		return;
	}

	previousFlipped.classList.remove('is-flipped');

	flipperParent.prepend(previousFlipped);
};

const flipClockPart = (part) => {
	const [flipper] = [...part.querySelectorAll('.flipper:not(.is-flipped)')].reverse();

	flipper.addEventListener('transitionend', onTransitionEnd);

	flipper.classList.add('is-flipped');

	return flipper;
};

const hourFlippers = [...hoursContainer.querySelectorAll('.flipper')].reverse();
const minuteFlippers = [...minutesContainer.querySelectorAll('.flipper')].reverse();

for (let i = 0; i < hourNow - 2; i++) {
	hourFlippers[i].parentNode.prepend(hourFlippers[i]);
}

for (let i = 0; i < minutesNow - 2; i++) {
	minuteFlippers[i].parentNode.prepend(minuteFlippers[i]);
}

hourButton.addEventListener('click', () => flipClockPart(hoursContainer));
minuteButton.addEventListener('click', () => flipClockPart(minutesContainer));

flipClockPart(hoursContainer);
flipClockPart(minutesContainer);

setInterval(() => {
	const currentMinuteFLipper = flipClockPart(minutesContainer);
	const currentMinute = currentMinuteFLipper.dataset.number;

	if (currentMinute === '59') {
		flipClockPart(hoursContainer);
	}
}, 500);
