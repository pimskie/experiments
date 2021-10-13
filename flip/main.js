const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

const now = new Date();
const hourNow = now.getHours();
const minutesNow = now.getMinutes();
const secondsNow = now.getSeconds();

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

const getFlippers = (numCurrent, numMax) => {
	const numComplete = `${numCurrent}`.padStart(2, '0');
	const numCompleteNext = numCurrent === numMax
		? '00'
		: `${numCurrent + 1}`.padStart(2, '0');

	return getFlipperTemplate(numComplete, numCompleteNext);
};

const hoursContainer = qs('.js-hours');
const minutesContainer = qs('.js-minutes');
const secondsContainer = qs('.js-seconds');

hoursContainer.innerHTML = new Array(24)
	.fill()
	.map((_, index) => getFlippers(index, 23))
	.reverse()
	.join('');

minutesContainer.innerHTML = new Array(60)
	.fill()
	.map((_, index) => getFlippers(index, 59))
	.reverse()
	.join('');

secondsContainer.innerHTML = new Array(60)
	.fill()
	.map((_, index) => getFlippers(index, 59))
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
const secondFlippers = [...secondsContainer.querySelectorAll('.flipper')].reverse();

for (let i = 0; i < hourNow - 1; i++) {
	hourFlippers[i].parentNode.prepend(hourFlippers[i]);
}

for (let i = 0; i < minutesNow - 1; i++) {
	minuteFlippers[i].parentNode.prepend(minuteFlippers[i]);
}

for (let i = 0; i < secondsNow - 1; i++) {
	secondFlippers[i].parentNode.prepend(secondFlippers[i]);
}

flipClockPart(hoursContainer);
flipClockPart(minutesContainer);
flipClockPart(secondsContainer);

setInterval(() => {
	const currentSecondFlipper = flipClockPart(secondsContainer);
	const currentSecond = currentSecondFlipper.dataset.number;

	if (currentSecond === '59') {
		const currentMinuteFlipper = flipClockPart(minutesContainer);
		const currentMinute = currentMinuteFlipper.dataset.number;

		if (currentMinute === '59') {
			flipClockPart(hoursContainer);
		}
	}
}, 1000);
