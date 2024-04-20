import * as vscode from 'vscode';



/**
 * Creates the CSS applied to the VS Code tab that will display the graph.  
 * @param colorScheme - The color scheme extension setting.
 * @returns A string containing the CSS.
 */
function makePanelStyles(colorScheme: string): string {
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

	return style;
}


/**
 * Opens the requested file in a VS Code tab.
 * @param path - The path of the requested file, relative to its workspace folder.
 */
async function openFileInVSCode(path: string) {
	try {
		let realFileUri: vscode.Uri | undefined;

		// Search for the requested file in all workspace folders
		// (it could be in another workspace folder than the file that was analyzed?)
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) throw new Error('No folder opened in workspace');
		searchFile: for (const folder of workspaceFolders) {
			try {
				const tempUri = vscode.Uri.joinPath(folder.uri, path);
				await vscode.workspace.fs.stat(tempUri);
				realFileUri = tempUri;
				break searchFile;
			} catch (error) {}
		}
		if (!realFileUri) throw new Error(`Could not find "${path}" in workspace`);

		// If the file was found, open it
		const doc = await vscode.workspace.openTextDocument(realFileUri);
		await vscode.window.showTextDocument(doc);
	}

	catch (error) {
		if (error instanceof Error) vscode.window.showErrorMessage(error.message);
	}
}


/**
 * Opens a graph in a new VS Code tab.
 * @param graph - A string containing the SVG of the graph.
 * @param title - The title of the tab that will display the graph.
 * @param userSettings - The user's extension settings.
 * @param context - The extension context.
 */
export function openGraph(
	graph: string,
	title: string,
	userSettings: vscode.WorkspaceConfiguration,
	context: vscode.ExtensionContext,
): void {
	// Create the tab
	// and allow it to load a script that will open files when clicking on nodes
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

	// Listen for messages from the tab, asking to open files whose nodes were clicked on
	panel.webview.onDidReceiveMessage(
		async (message) => {
			switch (message.action) {
				case 'open': openFileInVSCode(message.path); break;
			}
		}
	);

	// Load the script that will send messages to open files when their nodes are clicked on
	const scriptUri = vscode.Uri.joinPath(context.extensionUri, 'out/webview/open-links-in-vscode.js');
	const panelScriptUri = panel.webview.asWebviewUri(scriptUri);

	// Create the tab's HTML
	panel.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title${title}</title>
				<style>${makePanelStyles(userSettings.graph.colorScheme)}</style>
				<script type="module" src="${panelScriptUri}"></script>
			</head>
			<body>
				${graph}
			</body>
		</html>
	`;
}