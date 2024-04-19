import * as vscode from 'vscode';
import themeBase from './themes/base.js';
import themeEngineering from './themes/engineering.js';

const themes = new Map([
	['base', themeBase],
	['engineering', themeEngineering]
]);

export async function analyzeDependencies(
	relativeFilePath: string,
	fnOptions: {
		workspaceFolderPath: string
	}
) {
	const DepCruiser = await import('dependency-cruiser');
	const cruise = DepCruiser.cruise;

	const userSettings = vscode.workspace.getConfiguration('dependency-cruiser-ts');

	// Setting: theme
	const theme: {
		[key: string]: unknown,
		graph?: { [key: string]: unknown },
	} = themes.get(userSettings.graph.theme ?? 'base') ?? {};

	// Setting: graph direction
	if (!('graph' in theme) || typeof theme.graph !== 'object') theme.graph = {};
	theme.graph.rankdir = userSettings.graph.direction ?? 'LR';

	// Setting: collapse pattern
	const collapsePattern = userSettings.graph.collapsePattern;

	// Setting: tsconfig location
	const tsConfigNames = (userSettings.tsConfigNames as string)
		.split(',')
		.map(v => v.trim())
		.filter(v => v);
	const currentPath = relativeFilePath.split('/');
	let realTsconfigName: string | undefined;
	tsconfigSearch: while (currentPath.length > 0) {
		currentPath.pop();
		for (const name of tsConfigNames) {
			const uri = vscode.Uri.file(fnOptions.workspaceFolderPath + '/' + currentPath.join('/') + '/' + name);
			try {
				const exists = !!(await vscode.workspace.fs.stat(uri));
				if (exists) {
					//vscode.window.showInformationMessage(`tsconfig.json found: ${uri.path}`);
					realTsconfigName = name;
					break tsconfigSearch;
				}
			} catch (error) {
			}
		}
	}
	// Do not stop if there is no .tsconfig! Graphs can still be made, for example for a JS project

	// Setting: reporter
	const reporter = userSettings.graph.reporter ?? 'dot';

	const options: NonNullable<Parameters<typeof cruise>[1]> = {
		outputType: reporter,
		moduleSystems: ['es6', 'cjs'],
		tsPreCompilationDeps: true,
		tsConfig: { fileName: realTsconfigName },
		//prefix: `vscode://file/${process.cwd()}/`,
		reporterOptions: {
			dot: {
				theme: theme,
				collapsePattern: collapsePattern,
			}
		},
		parser: 'tsc',
	};

	const cruiseResult: Awaited<ReturnType<typeof cruise>> = await cruise(
		[relativeFilePath],
		options
	);

	return cruiseResult;
}