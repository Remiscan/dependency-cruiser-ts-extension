import type { analyzeDependencies } from "./analyze-dependencies.js";
import { instance } from '@viz-js/viz';



/**
 * Makes a dependency graph as SVG.
 * @param analysis - The dependency cruiser analysis result.
 * @returns A string containing the SVG.
 */
export async function makeGraph(analysis: Awaited<ReturnType<typeof analyzeDependencies>>) {
	const viz = await instance();
	if (typeof analysis.output !== 'string') {
		throw new TypeError('Expecting string');
	}

	const graph = viz.renderString(analysis.output, {
		format: 'svg',
		engine: 'dot',
	});

	return graph;
}