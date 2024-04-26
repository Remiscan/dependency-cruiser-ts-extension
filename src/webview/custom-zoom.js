/** Number by which the zoom level is multiplied or divided at each step. */
let zoomCoeff = 1.1;

/** Minimal zoom level. */
let minZoom = 1 / (zoomCoeff ** 6);

/** Maximal zoom level. */
let maxZoom = 1 * (zoomCoeff ** 8);

/** Current zoom level. */
let currentZoom = 1;

/** SVG element that contains the graph. */
const svg = document.querySelector('svg');

/** Initial width of the SVG element. */
let initialSvgWidth = parseInt(svg.getAttribute('width').replace('pt', ''));

const scroller = document.querySelector('.svg-container');



/**
 * Zoom in (or out) on the graph.
 * @param {'down'|'up'|'reset'} direction - Direction of the zoom.
 * 	- `down` makes the zoom level smaller
 * 	- `up` makes the zoom level bigger
 * 	- `reset` brings the zoom level back to `100%`
 * @param {{ x: number, y: number }} focusPoint - Screen coordinates of the point of the graph that should not move when the zoom level changes.
 */
function doZoom(direction, focusPoint = { x: 0, y: 0}) {
	const svgSizeBefore = {
		x: svg.clientWidth,
		y: svg.clientHeight
	};

	if (focusPoint.x > svgSizeBefore.x || focusPoint.y > svgSizeBefore.y) {
		focusPoint = { x: 0, y: 0 };
	}

	// Compute the scroll position to compensate for the new zoom and keep the focus point in the same place
	// - Quantity of scroll before updating the zoom level
	const scrollPositionBefore = {
		x: scroller.scrollLeft,
		y: scroller.scrollTop
	};
	// - Coordinates of the focus point in the SVG in pixels before updating the zoom level
	const svgFocusPointBefore = {
		x: scrollPositionBefore.x + focusPoint.x,
		y: scrollPositionBefore.y + focusPoint.y
	};
	// - Coordinates of the focus point in the SVG in percentage before updating the zoom level
	const svgFocusPointRatio = {
		x: svgFocusPointBefore.x / svgSizeBefore.x,
		y: svgFocusPointBefore.y / svgSizeBefore.y
	};

	// Compute the new zoom level
	switch (direction) {
		case 'down': currentZoom = Math.max(minZoom, currentZoom / zoomCoeff); break;
		case 'up': currentZoom = Math.min(currentZoom * zoomCoeff, maxZoom); break;
		case 'reset': currentZoom = 1; break;
	}

	// Apply the new zoom level to the SVG element
	svg.setAttribute('width', `${currentZoom * initialSvgWidth}pt`);
	svg.removeAttribute('height');

	// Update the scroll position to compensate for the new zoom and keep the focus point in the same place
	// - Coordinates of the focus point in the SVG in percentage after updating the zoom level
	const svgFocusPointAfter = {
		x: svgFocusPointRatio.x * svg.clientWidth,
		y: svgFocusPointRatio.y * svg.clientHeight
	};
	// - Coordinates of the focus point in the SVG in pixels after updating the zoom level
	const scrollPositionAfter = {
		x: svgFocusPointAfter.x - focusPoint.x,
		y: svgFocusPointAfter.y - focusPoint.y
	};
	// - Update scroll position
	scroller.scroll(
		scrollPositionAfter.x,
		scrollPositionAfter.y
	);
	

	// Update the zoom level hint in the panel's top bar
	document.getElementById('zoom-level').innerText = `${Math.round(currentZoom * 100)}%`;
}



// Zoom in or out when the users scrolls with the mouse wheel while pressing the `CTRL` key.
window.addEventListener('wheel', event => {
	if (!event.ctrlKey) return;

	const focusPoint = {
		x: event.clientX,
		y: event.clientY
	};

	if (event.deltaX >= 0 && event.deltaY >= 0) {
		doZoom('down', focusPoint);
	}

	else if (event.deltaX <= 0 && event.deltaY <= 0) {
		doZoom('up', focusPoint);
	}
});

// Zoom out when the user clicks on the "minus" button in the panel's top bar.
document.getElementById('zoom-down').addEventListener('click', () => {
	doZoom('down');
});

// Zoom out when the user clicks on the "plus" button in the panel's top bar.
document.getElementById('zoom-up').addEventListener('click', () => {
	doZoom('up');
});

// Resets the zoom level when the user clicks on the "reset" button in the panel's top bar.
document.getElementById('reset-zoom').addEventListener('click', () => {
	doZoom('reset');
	scroller.scroll(0, 0);
});