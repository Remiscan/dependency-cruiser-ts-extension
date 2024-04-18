import themeBase from './themes/base.js';
import themeEngineering from './themes/engineering.js';
import themeVertical from './themes/vertical.js';

const themes = new Map([
	['base', themeBase],
	['vertical', themeVertical],
	['engineering', themeEngineering]
]);

export async function analyzeDependencies(relativeFilePath: string) {
	const DepCruiser = await import('dependency-cruiser');
	const cruise = DepCruiser.cruise;

	const options: NonNullable<Parameters<typeof cruise>[1]> = {
		outputType: 'dot',
		moduleSystems: ['es6', 'cjs'],
		tsPreCompilationDeps: true,
		tsConfig: {},
		prefix: `vscode://file/${process.cwd()}/`,
		reporterOptions: {
			dot: {
				theme: themes.get('vertical'),
				collapsePattern: "^(node_modules/[^/]+)",
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