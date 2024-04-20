import * as vscode from 'vscode';
import { findTsConfig } from './find-tsconfig';



type Theme = {
	graph?: { [key: string]: unknown },
};

type ImportedTheme = { default: Theme } | { default: { default: Theme }};


/**
 * Uses `dependency-cruiser` to analyze the dependencies of a file.
 * @param relativeFilePath - The path of the file to analyze.
 * @param workspaceFolderPath - The path of the workspace folder that contains the file.
 * @param userSettings - The user's extension settings.
 * @returns The results of the analysis.
 */
export async function analyzeDependencies(
	relativeFilePath: string,
	workspaceFolderPath: string,
	userSettings: vscode.WorkspaceConfiguration,
) {
	const DepCruiser = await import('dependency-cruiser');
	const cruise = DepCruiser.cruise;


	// ----------------------
	// #region GET USER THEME

	const themeFile: ImportedTheme = await import(`./themes/${userSettings.graph.theme}.js`);

	// Node nests the default export...
	let theme = themeFile.default;
	if ('default' in theme) theme = theme.default;

	if (!('graph' in theme) || typeof theme.graph !== 'object') theme.graph = {};
	theme.graph.rankdir = userSettings.graph.direction; // Graph direction
	//theme.graph.splines = userSettings.graph.linesShape; // Shape of the lines between nodes

	// #endregion
	// ----------------------


	// --------------------
	// #region GET TSCONFIG

	const tsConfigUri = await findTsConfig(relativeFilePath, workspaceFolderPath, userSettings);

	// #endregion
	// --------------------


	// ---------------------------
	// #region CRUISE DEPENDENCIES

	const options: NonNullable<Parameters<typeof cruise>[1]> = {
		outputType: 'dot',
		moduleSystems: ['es6', 'cjs'],
		tsPreCompilationDeps: true,
		tsConfig: { fileName: tsConfigUri?.path },
		reporterOptions: {
			dot: {
				theme: theme,
				collapsePattern: userSettings.analysis.collapsePattern,
			}
		},
		parser: 'tsc',
	};

	const cruiseResult: Awaited< ReturnType<typeof cruise> > = await cruise(
		[relativeFilePath],
		options
	);

	// # endregion
	// ---------------------------


	return cruiseResult;
}