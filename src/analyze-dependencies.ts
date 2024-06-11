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


	// --------------------------------
	// #region GET CUSTOM CONFIGURATION

	type RuleSet = NonNullable<NonNullable<Parameters<typeof cruise>[1]>['ruleSet']>;
	type Rule = NonNullable<RuleSet['forbidden']>[0];

	type CruiseOptions = NonNullable<Parameters<typeof cruise>[1]>;
	interface CruiseConfig extends RuleSet {
		options: CruiseOptions
	}

	let options: CruiseOptions | undefined;
	let ruleSet: Partial<RuleSet> | undefined;

	if (userSettings.analysis.enableCustomConfiguration) {
		// Find the custom configuration file if it exists
		const customConfigurationFilePath = `${workspaceFolderPath}/.dependency-cruiser.json`;
		let customConfiguration: CruiseConfig | undefined;
		try {
			const uri = vscode.Uri.file(customConfigurationFilePath);
			customConfiguration = JSON.parse(
				(await vscode.workspace.fs.readFile(uri)).toString()
			);
		} catch (e) {}

		// If the custom configuration file exists, use it to configure `dependency-cruiser`
		if (customConfiguration && Object.keys(customConfiguration).length > 0) {
			if ('options' in customConfiguration) {
				options = customConfiguration.options;
			}

			if (
				'forbidden' in customConfiguration ||
				'allowed' in customConfiguration ||
				'allowedSeverity' in customConfiguration ||
				'required' in customConfiguration
			) {
				ruleSet = { ...customConfiguration };
				if ('options' in ruleSet) delete ruleSet.options;
			}
		}
	}

	// #endregion
	// --------------------------------


	// -----------------------------------------
	// #region DEFINE DEPENDENCY-CRUISER OPTIONS

	// If no custom configuration was found, or it contains no options, use the extension's configuration for options
	if (typeof options === 'undefined') {
		// GET USER THEME
		const theme = await importDefault<Theme>(`./themes/${userSettings.graph.theme}.js`);
		if (!('graph' in theme) || typeof theme.graph !== 'object') theme.graph = {};
		theme.graph.rankdir = userSettings.graph.direction; // Graph direction
		theme.graph.splines = userSettings.graph.linesShape; // Shape of the lines between nodes

		// GET TSCONFIG
		const tsConfigUri = isTypescript
			? await findTsConfig(relativeFilePath, workspaceFolderPath, userSettings)
			: undefined;

		options = {
			"outputType": "dot",
			"moduleSystems": ["es6", "cjs"],
			"tsPreCompilationDeps": true,
			"tsConfig": { "fileName": tsConfigUri?.fsPath },
			"includeOnly": userSettings.analysis.includeOnly || undefined,
			"exclude": userSettings.analysis.exclude || undefined,
			"reporterOptions": {
				"dot": {
					"theme": theme,
					"collapsePattern": userSettings.analysis.collapsePattern,
				}
			},
			"parser": 'tsc',
		};
	}

	// If no custom configuration was found, or it contains no rules, use the extension's configuration for rules
	if (typeof ruleSet === 'undefined') {
		// GET PRESET RULES
		const presetRules: Rule[] = [];
		if (userSettings.analysis.rules.noCircular) presetRules.push(await importDefault('./rules/noCircular.js'));
		if (userSettings.analysis.rules.noDev) presetRules.push(await importDefault('./rules/noDev.js'));

		ruleSet = {
			"forbidden": presetRules,
		};
	}

	// Apply the ruleSet to the options
	options.ruleSet = ruleSet;
	if (Object.keys(ruleSet).length > 0) options.validate = true;

	// # endregion
	// -----------------------------------------


	// --------------
	// #region CRUISE

	const cruiseResult: Awaited< ReturnType<typeof cruise> > = await cruise(
		[relativeFilePath],
		options
	);

	// #endregion
	// --------------


	return cruiseResult;
}