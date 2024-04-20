const vscode = acquireVsCodeApi();
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