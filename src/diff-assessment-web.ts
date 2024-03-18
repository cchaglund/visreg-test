import { DIFF_DIR, RECEIVED_DIR, SUITE_SNAPS_DIR, cleanUp, getFileInfo, getHumanReadableFileSize, printColorText } from './utils';
import { programChoices } from './cli';
import * as fs from 'fs';
import * as path from 'path';
import startServer from './server';
import { devPort, serverPort } from './server/config';

export type Summary = {
	approvedFiles: string[];
	rejectedFiles: string[];
	duration: number;
	failed: boolean;	
}

export type DiffObject = {
	imageName: string;
	recievedSizeString: string;
	baselineModified: Date;
	index: number;
	total: number;
	files: {
		baseline: {
			location: string;
			fileName: string;
		},
		received: {
			location: string;
			fileName: string;
		},
		diff: {
			location: string;
			fileName: string;
		}
	}
}

let diffFilesForWeb: DiffObject[] = [];
let approvedFiles: string[] = [];
let rejectedFiles: string[] = [];
let duration: number;
let failed: boolean;

export type WebAssessmentArgs = {
	files: string[];
	duration: number;
	failed: boolean;
}

export const assessInWeb = (args: WebAssessmentArgs) => {
	const { files, duration: durationArg, failed: failedArg } = args;

	duration = durationArg;
	failed = failedArg;

	const diffFiles = files.map((file, index) => {
		return processImageViaWeb(file, index, files.length);
	});

	diffFilesForWeb = diffFiles;

	startServer(programChoices, diffFiles);

	// We can't open the browser from inside a container
	if (programChoices?.containerized) return;

	import('open').then((module) => {
		const port = process.env.NODE_ENV === 'development' ? devPort : serverPort;
		module(`http://localhost:${port}/assessment`);
	});
}


export const approveOrRejectViaWeb = (action: string, index: number) => {
	const { imageName, files} = diffFilesForWeb[index];

	if (action === 'approve') {		
		approvedFiles.push(imageName);
		const { baseline, received, diff } = files;

		fs.unlinkSync(path.join(SUITE_SNAPS_DIR(), baseline.fileName));
		fs.renameSync(path.join(RECEIVED_DIR(), received.fileName), path.join(SUITE_SNAPS_DIR(), baseline.fileName));
		fs.unlinkSync(path.join(DIFF_DIR(), diff.fileName));
	} else if (action === 'reject') {
		rejectedFiles.push(imageName);
	}
}

export const getSummary = () => {
	cleanUp();

	const summary: Summary = {
		approvedFiles,
		rejectedFiles,
		duration,
		failed
	}

	return summary;
}

const processImageViaWeb = (diffImageFile: string, index: number, total: number) => {
	const imageName = diffImageFile.replace('.diff.png', '');
	const receivedImageFile = imageName + '-received.png';
	const baseImageFile = imageName + '.base.png';

	const pathToDiffFile = path.join(DIFF_DIR(), diffImageFile);
	const pathToRecievedFile = path.join(RECEIVED_DIR(), receivedImageFile);
	const pathToBaselineFile = path.join(SUITE_SNAPS_DIR(), baseImageFile);
	const recievedSizeString = getHumanReadableFileSize(pathToRecievedFile);

	const baselineInfo = getFileInfo(pathToBaselineFile);

	const diffObject: DiffObject = {
		imageName,
		recievedSizeString,
		baselineModified: baselineInfo.modifiedAt,
		index,
		total,
		files: {
			baseline: {
				location: pathToBaselineFile,
				fileName: baseImageFile
			},
			received: {
				location: pathToRecievedFile,
				fileName: receivedImageFile
			},
			diff: {
				location: pathToDiffFile,
				fileName: diffImageFile
			}
		}
	}

	return diffObject;
}
