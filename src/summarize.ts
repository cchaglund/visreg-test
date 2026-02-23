import { programChoices } from './cli';
import { SuiteRunResult } from './types';
import { getDiffingFilesFromTestResult, printColorText, cleanUp } from './utils';

let approvedFiles: string[] = [];
let rejectedFiles: string[] = [];
let failed: boolean;
let duration: number;

export const resetSummaryState = () => {
	approvedFiles = [];
	rejectedFiles = [];
	failed = false;
	duration = 0;
};

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
		printColorText('Visual regression passed! (No diffs found)', '32');
		return;
	}
		
	printColorText(`Total diffs assessed: ${approvedFiles.length + rejectedFiles.length}`, '2');

	if (approvedFiles.length > 0) {
		console.log(`\x1b[2mApproved: \x1b[0m\x1b[32m${approvedFiles.length}\x1b[0m`)
	}

	if (rejectedFiles.length > 0) {
		console.log(`\x1b[2mRejected: \x1b[0m\x1b[31m${rejectedFiles.length}\x1b[0m`)
	}
}

/**
 * Summarize results without calling process.exit(). Used in queue mode
 * so the process can continue to the next suite.
 */
export const summarizeResults = (approvedFilesArg: string[], rejectedFilesArg: string[], failedArg: boolean) => {
	approvedFiles = approvedFilesArg;
	rejectedFiles = rejectedFilesArg;
	failed = failedArg;

	printColorText('\n\nSummary', '4');

	summarizeTest();
	summarizeAssessment();

	cleanUp();
};

export const summarizeResultsAndQuit = (approvedFilesArg: string[], rejectedFilesArg: string[], failedArg: boolean) => {
	summarizeResults(approvedFilesArg, rejectedFilesArg, failedArg);
	process.exit();
}

/**
 * Print a combined summary for a multi-suite queue run.
 */
export const summarizeSuiteQueue = (suiteResults: SuiteRunResult[]) => {
	printColorText('\n\nQueue Summary', '4');
	printColorText('─'.repeat(60), '2');

	let totalDiffs = 0;
	let totalFailed = 0;

	for (const result of suiteResults) {
		const status = result.failed ? '\x1b[33mpartial\x1b[0m' : '\x1b[32mpassed\x1b[0m';
		const diffCount = result.diffs.length;
		totalDiffs += diffCount;
		if (result.failed) totalFailed++;

		console.log(`\x1b[2mSuite: \x1b[0m${result.suite}  \x1b[2m| Status: \x1b[0m${status}  \x1b[2m| Diffs: \x1b[0m${diffCount}`);
	}

	printColorText('─'.repeat(60), '2');
	console.log(`\x1b[2mSuites run: \x1b[0m${suiteResults.length}`);
	console.log(`\x1b[2mTotal diffs: \x1b[0m${totalDiffs}`);

	if (totalFailed > 0) {
		console.log(`\x1b[2mSuites with errors: \x1b[0m\x1b[33m${totalFailed}\x1b[0m`);
	}

	if (totalDiffs === 0) {
		printColorText('\nVisual regression passed across all suites! (No diffs found)', '32');
	}
};
