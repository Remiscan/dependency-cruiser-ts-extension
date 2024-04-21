/** Gets the default export of a dynamic import, because node nests it... */
export function getDefaultExport<T = unknown>(dynamicImport: any): T {
	let def = dynamicImport.default;
	if ('default' in def) def = def.default;
	return def as T;
}

/** Imports the default export from a module, unnested for node. */
export async function importDefault<T = unknown>(identifier: string): Promise<T> {
	return getDefaultExport<T>(
		await import(identifier)
	);
}