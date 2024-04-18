import * as vscode from 'vscode';

export function openGraph({ vsc, fileName, graph, context }: {
	vsc: typeof vscode,
	fileName: string,
	graph: string,
	context: vscode.ExtensionContext
}) {
	const title = `${fileName} (dependencies)`;
	const panel = vscode.window.createWebviewPanel(
		`dependency-cruiser-results-${Date.now()}`,
		title,
		vscode.ViewColumn.One
	);

	panel.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title${title}</title>
			</head>
			<body>
				${graph}
			</body>
		</html>
	`;
}