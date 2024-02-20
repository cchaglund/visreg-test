import * as fs from 'fs';
import * as path from 'path';
import { program } from './cli-program';

export const projectRoot = process.cwd();

export const suitesDirectory = path.join(projectRoot, 'suites');

export const pathExists = (dirPath: string) => fs.existsSync(dirPath);

export const hasFiles = (dirPath: string) => fs.readdirSync(dirPath).length > 0;

export const parsedViewport = (viewport?: string | number[]) => {	
	if (!viewport) {
		return;
	}

	const stringedViewport = viewport.toString();
	if (!stringedViewport?.includes(',')) {
		return viewport;
	}

	return stringedViewport.split(',').map((pixels: string) => parseInt(pixels))
}

export const createScaffold = () => {
	const typescript = program.opts().scaffoldTs;
	const scaffoldRoot = path.join(__dirname, 'scaffold');
	const fileName = typescript ? 'snaps.ts' : 'snaps.js';
	const source = path.join(scaffoldRoot, fileName);
	
	if (!pathExists(suitesDirectory)) {		
		fs.mkdirSync(suitesDirectory);
	}

	const destination = path.join(suitesDirectory, 'test-suite');

	if (!pathExists(destination)) {
		fs.mkdirSync(destination);
	}

	fs.copyFileSync(source, path.join(destination, fileName));

	if (typescript) {
		fs.copyFileSync(path.join(scaffoldRoot, 'tsconfig-scaffold.json'), path.join(projectRoot, 'tsconfig.json'));
	}
}

export const removeDirIfEmpty = (dirPath: string) => {
    if (!pathExists(dirPath) || hasFiles(dirPath)) {
		return;
	}

	try {
		fs.rmSync(dirPath, { recursive: true })
    } catch (err) {
        console.error(err);
    }
}

export const printColorText = (text: string, colorCode: string) => {
	console.log(`\x1b[${ colorCode }m${ text }\x1b[0m`);
};

export const getFileSizeInMegabytes = (filePath: string) => {
    const stats = fs.statSync(filePath);
	const fileSizeInBytes = stats.size;
	const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
	return fileSizeInMegabytes.toFixed(2) + 'MB';
}