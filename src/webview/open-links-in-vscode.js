const vscode = acquireVsCodeApi();

// Intercept all clicks on graph nodes to open the corresponding file in VS Code
const links = Array.from(document.querySelectorAll('svg a'));
for (const link of links) {
	link.addEventListener('click', async (event) => {
		event.preventDefault();
		const path = link.getAttribute('xlink:href');
		vscode.postMessage({
			action: 'open',
			path
		});
	})
}

// Converts the SVG graph to a data URL
function getGraphDataUrl() {
	const svg = document.querySelector('svg');
	return "data:image/svg+xml;base64," + btoa(svg.outerHTML);
}

// Save the graph as an SVG file when clicking on the corresponding button
document.getElementById('save-file').addEventListener('click', event => {
	vscode.postMessage({
		action: 'save-svg',
		content: document.querySelector('svg').outerHTML
	});
});

// Copy the graph as a data URL when clicking on the corresponding button
document.getElementById('copy-url').addEventListener('click', event => {
	navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
		if (result.state === "granted" || result.state === "prompt") {
			navigator.clipboard.writeText(
				getGraphDataUrl()
			)
			.then(() => vscode.postMessage({
				action: 'notify',
				content: "Graph copied as a data URL."
			}));
		}
	});
});