import * as vscode from 'vscode';
import { findTsConfig } from './find-tsconfig';
import { importDefault } from './get-default-export';



type Theme = {
	graph?: { [key: string]: unknown },
};


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
	{ isTypescript }: { isTypescript: boolean }
) {
	const DepCruiser = await import('dependency-cruiser');
	const cruise = DepCruiser.cruise;


	// ----------------------
	// #region GET USER THEME

	const theme = await importDefault<Theme>(`./themes/${userSettings.graph.theme}.js`);

	if (!('graph' in theme) || typeof theme.graph !== 'object') theme.graph = {};
	theme.graph.rankdir = userSettings.graph.direction; // Graph direction
	theme.graph.splines = userSettings.graph.linesShape; // Shape of the lines between nodes

	// #endregion
	// ----------------------


	// --------------------
	// #region GET TSCONFIG

	const tsConfigUri = isTypescript
		? await findTsConfig(relativeFilePath, workspaceFolderPath, userSettings)
		: undefined;

	// #endregion
	// --------------------


	// ------------------------
	// #region GET PRESET RULES

	type Rule = NonNullable<NonNullable<NonNullable<Parameters<typeof cruise>[1]>['ruleSet']>['forbidden']>[0];
	const rules: Rule[] = [];
	if (userSettings.analysis.rules.noCircular) rules.push(await importDefault('./rules/noCircular.js'));
	if (userSettings.analysis.rules.noDev) rules.push(await importDefault('./rules/noDev.js'));

	// #endregion
	// ------------------------


	// ---------------------------
	// #region CRUISE DEPENDENCIES

	const options: NonNullable<Parameters<typeof cruise>[1]> = {
		outputType: 'dot',
		moduleSystems: ['es6', 'cjs'],
		tsPreCompilationDeps: true,
		tsConfig: { fileName: tsConfigUri?.path },
		includeOnly: userSettings.analysis.includeOnly || undefined,
		exclude: userSettings.analysis.exclude || undefined,
		validate: rules.length > 0,
		ruleSet: {
			forbidden: rules,
		},
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