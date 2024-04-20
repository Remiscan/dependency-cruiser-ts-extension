// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { instance } from '@viz-js/viz';
import * as vscode from 'vscode';
import { analyzeDependencies } from './analyze-dependencies.js';
import { openGraph } from './open-graph.js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dependency-cruiser-ts" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('dependency-cruiser-ts.analyzeDependencies', async (fileUri) => {
		if (!fileUri) fileUri = vscode.window.activeTextEditor?.document.uri;
		if (!fileUri) throw new Error(`Undefined file uri`);

		const absoluteFilePath = fileUri.path;
		const workspaceFolderPath = vscode.workspace.getWorkspaceFolder(fileUri)?.uri.path;
		if (!workspaceFolderPath) throw new Error('Undefined workspace folder path');

		const relativeFilePath = absoluteFilePath.replace(`${workspaceFolderPath}/`, '');
		console.log(relativeFilePath);
		const fileName = relativeFilePath.split('/').at(-1);

		const userSettings = vscode.workspace.getConfiguration('dependency-cruiser-ts');

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			cancellable: false,
			title: `Computing dependency graph for "${fileName}"...`
		}, async (progress) => {
			try {
				process.chdir(workspaceFolderPath);
				const analysis = await analyzeDependencies(relativeFilePath, {
					workspaceFolderPath,
					userSettings
				});
	
				const viz = await instance();
				if (typeof analysis.output !== 'string') {
					throw new TypeError('Expecting string');
				}
	
				const graph = viz.renderString(analysis.output, {
					format: 'svg',
					engine: 'dot',
				});
				
				return openGraph({
					fileName,
					graph,
					colorScheme: userSettings.graph.colorScheme,
					context
				});
			} catch (error) {
				if (error instanceof Error) {
					vscode.window.showErrorMessage(error.message);
				}
			}

			progress.report({ increment: 100 });
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
