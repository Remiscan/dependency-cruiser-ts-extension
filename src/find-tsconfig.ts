import * as vscode from 'vscode';



/** Matches a "/" or "\". */
export const filePathSeparatorRegex = /\u002f|\u005c/;


async function promptUserToChooseTsConfig(
	matchingFiles: vscode.Uri[],
	analyzedFilePath: string,
	workspaceFolderPath: string,
) {
	const absoluteAnalyzedFilePath = `${workspaceFolderPath}/${analyzedFilePath}`;
	
	/**
	 * Computes how close a tsconfig file is to the analyzed file.  
	 * The closeness score corresponds to how much of the file paths are common.  
	 * @param fileUri - The Uri of the file whose closeness with the analyzed file will be computed.
	 * @returns The negative number of path segments that are common to the two files.  
	 *          The lower the score is (i.e. the higher its absolute value is), the closer the files are to each other.
	 */
	const getClosenessScore = (fileUri: vscode.Uri): number => {
		const filePath = fileUri.fsPath;
		const currentPath = filePath.split(filePathSeparatorRegex);
		while (currentPath.length > 0) {
			currentPath.pop();
			if (
				absoluteAnalyzedFilePath.startsWith(currentPath.join('/')) ||
				absoluteAnalyzedFilePath.startsWith(currentPath.join('\\'))
			) return -currentPath.length;
		}
		return 0;
	};

	/**
	 * Computes the length of a file name.
	 * @param fileUri - The Uri of the file.
	 */
	const getFileNameLength = (fileUri: vscode.Uri): number => {
		return fileUri.path.split(filePathSeparatorRegex).at(-1)?.length ?? 0;
	}

	// Sort the matching files by closeness to the analyzed file
	matchingFiles.sort((a, b) => {
		return getClosenessScore(a) - getClosenessScore(b)
			|| getFileNameLength(a) - getFileNameLength(b);
		}
	);

	// Prompt the user to choose one of the files, and return their choice
	return vscode.window.showQuickPick(matchingFiles.map((uri, index) => {
		return {
			label: uri.fsPath.split(filePathSeparatorRegex).at(-1) ?? uri.fsPath,
			detail: uri.fsPath,
			index,
		};
	}), {
		title: "Select a tsconfig file"
	});
}


/**
 * Finds the tsconfig file of the project if there is one.
 * @param analyzedFilePath 
 * @param workspaceFolderPath 
 * @param userSettings 
 */
export async function findTsConfig(
	analyzedFilePath: string,
	workspaceFolderPath: string,
	userSettings: vscode.WorkspaceConfiguration,
): Promise<vscode.Uri | null> {
	const tsConfigPattern = userSettings.analysis.tsConfigPattern;

	// Find all tsconfig files in the workspace
	const includeGlob = `**/${tsConfigPattern}`;
	const excludeGlob = '**/node_modules/**';
	const matchingFiles = await vscode.workspace.findFiles(includeGlob, excludeGlob);

	// If there's only one, pick it automatically
	if (matchingFiles.length === 1) return matchingFiles[0];

	// If there's more than one, ask the user which one to use
	if (matchingFiles.length > 1) {
		const userChoice = await promptUserToChooseTsConfig(
			matchingFiles,
			analyzedFilePath,
			workspaceFolderPath,
		)
		if (userChoice) return matchingFiles[userChoice.index];
	}

	return null;
}