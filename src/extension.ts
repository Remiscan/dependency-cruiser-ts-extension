import * as vscode from 'vscode';
import { analyzeDependencies } from './analyze-dependencies.js';
import { makeGraph } from './make-graph.js';
import { openGraph } from './open-graph.js';



function makeCommandHandler(
	context: vscode.ExtensionContext,
	{ isTypescript }: { isTypescript: boolean },
) {
	return async (_fileUri: vscode.Uri) => {
		/** Uri of the file the user wants to analyze. */
		const fileUri = (_fileUri  as vscode.Uri) ?? vscode.window.activeTextEditor?.document.uri;
		if (!fileUri) throw new Error(`Undefined file uri`);

		/** Path of the workspace folder that contains the file the user wants to analyze. */
		const workspaceFolderPath = vscode.workspace.getWorkspaceFolder(fileUri)?.uri.path;
		if (!workspaceFolderPath) throw new Error('Undefined workspace folder path');

		/** Path of the file the user wants to analyze relative to the workspace folder that contains it. */
		const relativeFilePath = fileUri.path.replace(`${workspaceFolderPath}/`, '');
		const fileName = relativeFilePath.split('/').at(-1);

		/**
		 * Extension settings.  
		 * Takes the default values defined in `package.json` and overwrites them with with user settings.
		 */
		const userSettings = vscode.workspace.getConfiguration('dependency-cruiser-ts');

		// Displays a loading bar in a notification while the dependency graph is being computed
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			cancellable: false,
			title: `Computing dependency graph for "${fileName}"...`
		}, async (progress) => {
			try {
				// Analyze dependencies
				process.chdir(workspaceFolderPath);
				const analysis = await analyzeDependencies(
					relativeFilePath,
					workspaceFolderPath,
					userSettings,
					{ isTypescript }
				);

				// Make the dependency graph
				const graph = await makeGraph(analysis);

				// Display the graph in a new tab
				return openGraph(
					graph,
					`${fileName} (dependencies)`,
					userSettings,
					context
				);
			}

			catch (error) {
				if (error instanceof Error) {
					const configurationError = error.stack?.includes("at normalizeCruiseOptions");
					console.error(error);
					vscode.window.showErrorMessage(
						configurationError
							? `Your \`.dependency-cruiser.json\` file is not correctly formatted (error: ${error.message})`
							: `An error occurred: ${error.message}`
					);
				}
			}

			progress.report({ increment: 100 });
		});
	};
}



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(
		'dependency-cruiser-ts.analyzeDependencies',
		makeCommandHandler(context, { isTypescript: true })
	);
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
