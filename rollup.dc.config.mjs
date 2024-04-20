import { dts } from "rollup-plugin-dts";

export default [
	{
		input: './node_modules/dependency-cruiser/src/main/index.d.ts',
		output: [{ file: "dist/dependency-cruiser.d.ts", format: "es" }],
		plugins: [
			//nodeResolve(),
			dts(),
		],
	}
]