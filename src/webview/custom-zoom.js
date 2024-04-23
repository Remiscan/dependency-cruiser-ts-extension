let zoomCoeff = 1.1;
let minZoom = 1 / (zoomCoeff ** 6);
let maxZoom = 1 * (zoomCoeff ** 8);
let zoom = 1;

const svg = document.querySelector('svg');
let initialSvgWidth = parseInt(svg.getAttribute('width').replace('pt', ''));

window.addEventListener('wheel', event => {
	if (!event.ctrlKey) return;

	if (event.deltaX >= 0 && event.deltaY >= 0) {
		zoomDown();
	}

	else if (event.deltaX <= 0 && event.deltaY <= 0) {
		zoomUp();
	}
});

document.getElementById('zoom-down').addEventListener('click', () => {
	zoomDown();
});

document.getElementById('zoom-up').addEventListener('click', () => {
	zoomUp();
});

document.getElementById('reset-zoom').addEventListener('click', () => {
	zoom = 1;
	applyZoom();
});

function zoomDown() {
	zoom = Math.max(minZoom, zoom / 1.1);
	applyZoom();
}

function zoomUp() {
	zoom = Math.min(zoom * 1.1, maxZoom);
	applyZoom();
}

function applyZoom() {
	svg.setAttribute('width', `${zoom * initialSvgWidth}pt`);
	svg.removeAttribute('height');
	document.getElementById('zoom-level').innerText = `${Math.round(zoom * 100)}%`;
}