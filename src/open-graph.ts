import * as vscode from 'vscode';

export function openGraph({ fileName, graph, colorScheme, context }: {
	fileName: string,
	graph: string,
	colorScheme: string,
	context: vscode.ExtensionContext
}) {
	const title = `${fileName} (dependencies)`;
	const webviewResourceUri = vscode.Uri.joinPath(context.extensionUri, 'out/webview');
	const panel = vscode.window.createWebviewPanel(
		`dependency-cruiser-results-${Date.now()}`,
		title,
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			localResourceRoots: [webviewResourceUri]
		}
	);

	const darkModeStyle = /*css*/`
		body {
			filter: invert() hue-rotate(180deg);
		}
	`;

	let style = '';
	switch (colorScheme) {
		case 'light': break;
		case 'dark':
			style = darkModeStyle
			break;
		default:
			style = /*css*/`
				@media (prefers-color-scheme: dark) {
					${darkModeStyle}
				}
			`;
	}

	panel.webview.onDidReceiveMessage(
		async (message) => {
			switch (message.action) {
				case 'open':
					try {
						let realFileUri: vscode.Uri | undefined;
						const workspaceFolders = vscode.workspace.workspaceFolders;
						if (!workspaceFolders) throw new Error('No folder opened in workspace');
						searchFile: for (const folder of workspaceFolders) {
							try {
								const tempUri = vscode.Uri.joinPath(folder.uri, message.path);
								await vscode.workspace.fs.stat(tempUri);
								realFileUri = tempUri;
								break searchFile;
							} catch (error) {}
						}
						if (!realFileUri) throw new Error(`Could not find "${message.path}" in workspace`);
						const doc = await vscode.workspace.openTextDocument(realFileUri);
						await vscode.window.showTextDocument(doc);
					} catch (error) {
						if (error instanceof Error) vscode.window.showErrorMessage(error.message);
					}
					break;
			}
		}
	);

	const scriptUri = vscode.Uri.joinPath(context.extensionUri, 'out/webview/open-links-in-vscode.js');
	vscode.window.showErrorMessage(scriptUri.path);
	const panelScriptUri = panel.webview.asWebviewUri(scriptUri);

	panel.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title${title}</title>
				<style>${style}</style>
				<script type="module" src="${panelScriptUri}"></script>
			</head>
			<body>
				${graph}
			</body>
		</html>
	`;
}