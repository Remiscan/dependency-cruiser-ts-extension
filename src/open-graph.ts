import * as vscode from 'vscode';



/**
 * Creates the CSS applied to the VS Code tab that will display the graph.  
 * @param colorScheme - The color scheme extension setting.
 * @returns A string containing the CSS.
 */
function makePanelDarkStyles(colorScheme: string): string {
	const lightModeStyle = /*css*/`
		:root {
			color-scheme: light;
		}
	`;
	const darkModeStyle = /*css*/`
		:root {
			color-scheme: dark;
		}
		body, header {
			filter: invert() hue-rotate(180deg);
		}
	`;

	let style = '';
	switch (colorScheme) {
		case 'light':
			style = lightModeStyle
			break;
		case 'dark':
			style = darkModeStyle
			break;
		default:
			style = /*css*/`
				${lightModeStyle}
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
				<style>
					html {
						width: 100%;
						height: 100%;
						overflow: hidden;
					}
					body {
						padding: 0px;
						overflow: hidden;
						width: 100%;
						height: 100%;
						display: grid;
						grid-template-rows: 30px minmax(0, 1fr);
						grid-template-columns: minmax(0, 1fr);
					}
					body > * {
						display: contents;
					}
					header {
						z-index: 5;
						display: flex;
						flex-direction: row;
						justify-content: center;
						align-items: center;
						gap: 20px;
						background-color: var(--vscode-editor-background);
						color: var(--vscode-editor-foreground);
					}
					a {
						color: var(--vscode-textLink-foreground);
					}
					#zoom-level {
						display: inline-block;
						width: 5ch;
					}
					button {
						background: var(--vscode-button-secondaryBackground);
						color: var(--vscode-button-secondaryForeground);
						border: 1px solid var(--vscode-button-border);
						border-radius: 2px;
						height: 25px;
						min-width: 40px;
					}
					button:is(:hover, :focus-visible) {
						background: var(--vscode-button-secondaryHoverBackground);
					}
					.svg-container {
						display: grid;
						place-content: start;
						overflow: auto;
						scrollbar-gutter: stable;
					}
					svg {
						height: auto;
						margin-right: 100vmax; /* so there's always room to zoom in on the point under the mouse pointer */
						margin-bottom: 100vmax; /* so there's always room to zoom in on the point under the mouse pointer */
					}
					${makePanelDarkStyles(userSettings.graph.colorScheme)}
				</style>
				<script type="module" src="${panelScriptUri}"></script>
				<script type="module" src="${
					panel.webview.asWebviewUri(
						vscode.Uri.joinPath(context.extensionUri, 'out/webview/custom-zoom.js')
					)
				}"></script>
			</head>
			<body>
				<header>
					<button type="button" id="zoom-down"> − </button>
					<span>Zoom level <span id="zoom-level">100%</span></span>
					<button type="button" id="zoom-up"> + </button>
					<button type="button" id="reset-zoom">Reset zoom level</button>
				</header>
				<div class="svg-container">
					${graph}
				</div>
			</body>
		</html>
	`;
}