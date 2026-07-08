const getEl = ref => document.querySelector(`[data-ref=${ref}]`);

const radiusSlider = getEl('radius');
const radiusValue = getEl('radius-value');

const ellipseSlider = getEl('ellipse');
const ellipseValue = getEl('ellipse-value');

const panel = getEl('panel');

const setRadius = () => {
    const radius = radiusSlider.value;
    const ellipse = ellipseSlider.value;

    radiusValue.textContent = `${radius}`;
    ellipseValue.textContent = `${ellipse}`;

    panel.style.setProperty('--radius', radius);
    panel.style.setProperty('--ellipse', ellipse);
}

radiusSlider.addEventListener('input', setRadius);
ellipseSlider.addEventListener('input', setRadius);

setRadius();