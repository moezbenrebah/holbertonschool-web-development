const colorGrid = document.querySelector('#color-grid');
const selectedColorDiv = document.querySelector('#selected-color');
const colorNameP = document.querySelector('#color-name');
const colorHexP = document.querySelector('#color-hex');
const eventList = document.querySelector('#event-list');

let selectedColor = null;
let eventLog = [];
const MAX_LOG_ITEMS = 5;

const colors = generateColorPalette(10);

function init() {
    renderColorGrid();
    setupEventDelegation();
}

function generateColorPalette(count) {
    const palette = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
        const hue = Math.floor(i * hueStep);
        const saturation = 70 + Math.random() * 30;
        const lightness = 50 + Math.random() * 20;

        const color = {
            hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            hex: hslToHex(hue, saturation, lightness),
            name: `Color ${i + 1}`
        };

        palette.push(color);
    }

    return palette;
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

function renderColorGrid() {
    colors.forEach((color, index) => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color.hsl;
        colorBox.dataset.colorIndex = index;
        colorBox.dataset.colorName = color.name;
        colorBox.dataset.colorHex = color.hex;

        colorGrid.appendChild(colorBox);
    });
}

function setupEventDelegation() {
    colorGrid.addEventListener('click', handleColorClick);
}

function handleColorClick(event) {
    const clickedElement = event.target;
    const colorBox = clickedElement.closest('.color-box');

    if (!colorBox) return;

    const colorIndex = colorBox.dataset.colorIndex;
    const colorName = colorBox.dataset.colorName;
    const colorHex = colorBox.dataset.colorHex;
    const colorHsl = colorBox.style.backgroundColor;

    const previouslySelected = colorGrid.querySelector('.color-box.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }

    colorBox.classList.add('selected');

    selectedColorDiv.style.backgroundColor = colorHsl;
    colorNameP.textContent = colorName;
    colorHexP.textContent = colorHex;

    logEvent(`Clicked: ${colorName} picked (${colorHex})`);
}

function logEvent(message) {
    const logMessage = `${message}`;

    eventLog.unshift(logMessage);
    if (eventLog.length > MAX_LOG_ITEMS) {
        eventLog.pop();
    }

    renderEventLog();
}

function renderEventLog() {
    eventList.innerHTML = '';

    eventLog.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        eventList.appendChild(li);
    });
}

init();
