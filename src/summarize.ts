import { programChoices } from './cli';
import { getDiffingFilesFromTestResult, printColorText, cleanUp } from './utils';

let approvedFiles: string[] = [];
let rejectedFiles: string[] = [];
let failed: boolean;
let duration: number;

export const summarizeTest = () => {
	failed &&
		console.log(`\x1b[2mStatus: \x1b[0m\x1b[33mpartial\x1b[0m`)

	console.log(`\x1b[2mType: \x1b[0m\x1b[0m${programChoices.testType}\x1b[0m`)
	console.log(`\x1b[2mSuite: \x1b[0m\x1b[0m${programChoices.suite}\x1b[0m`)

	programChoices.targetEndpointTitles.length && 
		console.log(`\x1b[2mEndpoint: \x1b[0m\x1b[0m${programChoices.targetEndpointTitles.join(', ')}\x1b[0m`)

	programChoices.targetViewports.length &&
		console.log(`\x1b[2mViewport: \x1b[0m\x1b[0m${programChoices.targetViewports.join(', ')}\x1b[0m`)

	duration &&
		console.log(`\x1b[2mDuration: \x1b[0m\x1b[0m${duration}s\x1b[0m`)
}

const summarizeAssessment = () => {
	let files = getDiffingFilesFromTestResult();

	if (!files) {
		printColorText('🎉  Visual regression passed! (No diffs found)', '32');
		process.exit();
	}
		
	printColorText(`Total diffs assessed: ${approvedFiles.length + rejectedFiles.length}`, '2');

	if (approvedFiles.length > 0) {
		console.log(`\x1b[2mApproved: \x1b[0m\x1b[32m${approvedFiles.length}\x1b[0m`)
	}

	if (rejectedFiles.length > 0) {
		console.log(`\x1b[2mRejected: \x1b[0m\x1b[31m${rejectedFiles.length}\x1b[0m`)
	}
}

export const summarizeResultsAndQuit = (approvedFilesArg: string[], rejectedFilesArg: string[], failedArg: boolean) => {
    approvedFiles = approvedFilesArg;
    rejectedFiles = rejectedFilesArg;
    failed = failedArg;
    
	printColorText('\n\nSummary', '4');

	summarizeTest();
	summarizeAssessment();

	cleanUp();
	process.exit();
}
