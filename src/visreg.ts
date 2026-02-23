#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as readline from 'readline';
import { ConfigurationSettings, CypressScreenshotOptions, JestMatchImageSnapshotOptions, NonOverridableSettings, ProgramChoices, RequestSettings, SuiteRunResult, TestSettings, TestType, VisitSettings, VisregViewport } from './types';
import { programChoices } from './cli';
import { startServer } from './server';
import { assessInWeb, processImageViaWeb, resetWebAssessmentState } from './diff-assessment-web';
import { BACKUP_DIFF_DIR, BACKUP_RECEIVED_DIR, DIFF_DIR, RECEIVED_DIR, cleanUp, createFailingEndpointTestResult, createPassingEndpointTestResult, getAllDiffingFiles, getDiffingFilesFromTestResult, getSkippedEndpoints, getSuiteDirOrFail, getSuites, getUnchangedEndpoints, hasFiles, includedInTarget, isTargettedTest, parseAgenda, parseCypressSummary, parseViewport, pathExists, printColorText, projectRoot, removeBackups, suitesDirectory } from './utils';
import { assessInCLI, resetTerminalAssessmentState } from './diff-assessment-terminal';
import { summarizeResultsAndQuit, summarizeResults, summarizeSuiteQueue, resetSummaryState } from './summarize';

type DataPackage = {
	name: string;
	type: string;
	stdout: string;
	payload?: EndpointTestResult | SummaryObject;
	color: string;
};

export type SummaryObject = {
    tests?: number;
    passing?: number;
    failing?: number;
    pending?: number;
    skipped?: number;
    duration?: number;
};

export type EndpointTestResult = {
    testTitle: string;
    errorMessage?: string;
    endpointTitle: string;
    viewport: string;
};

export type EndpointTestResultsGroup = {
	passing: EndpointTestResult[],
	failing: EndpointTestResult[],
	skipped: EndpointTestResult[],
	unchanged: EndpointTestResult[],
};

const defaultBrowser = 'electron';
const configPath = path.join(projectRoot, 'visreg.config.json');

// Store the project-level config immutably so it can be cloned for each suite run
let projectLevelConfig: ConfigurationSettings = {};

if (pathExists(configPath)) {
	const fileContent = fs.readFileSync(configPath, 'utf-8');
	try {
		projectLevelConfig = JSON.parse(fileContent);
	} catch (e) { }
}

// Working config that gets merged with suite-level config per run. Reset from projectLevelConfig between suite runs.
let visregConfig: ConfigurationSettings = { ...projectLevelConfig };

let failed = false;
let userTerminatedTest = false;
let cypressSummary: SummaryObject = {};
let testAgenda: string[] = [];

const endpointTestResults: EndpointTestResultsGroup = {
	passing: [] as EndpointTestResult[],
	failing: [] as EndpointTestResult[],
	skipped: [] as EndpointTestResult[],
	unchanged: [] as EndpointTestResult[],
}

const typesList: TestType[] = [
	{
		name: 'Full',
		slug: 'full-test',
		description: 'Run a full visual regression test of all endpoints and viewports (previous diffs are deleted)'
	},
	{
		name: 'Retest diffs only',
		slug: 'diffs-only',
		description: 'Run only the tests which failed in the last run'
	},
	{
		name: 'Targetted',
		slug: 'targetted',
		description: 'Run a test for a specific endpoint and/or viewport'
	},
	{
		name: 'Assess diffs',
		slug: 'assess-existing-diffs',
		description: 'Assess the existing diffs (no tests are run)'
	},
	{
		name: 'Lab',
		slug: 'lab',
		description: 'Run the tests in lab mode'
	},
];

export const getVersion = () => {
	// Read the "version" field from package.json and print it out:
	const packageJsonPath = path.join(__dirname, '..', 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8') || '{}');
	return packageJson.version;
};

// Print config path
if (pathExists(configPath)) {
	printColorText(`\nProject config: ${configPath}`, '2');
}

// Print header
printColorText(`\n _  _  __  ____  ____  ____  ___ \n/ )( \\(  )/ ___)(  _ \\(  __)/ __)\n\\ \\/ / )( \\___ \\ )   / ) _)( (_ \\ \n \\__/ (__)(____/(__\\_)(____)\\___/ \x1b[2mv${getVersion()}\x1b[0m\n`, '36;1');

const promptForEndpointTitle = async () => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	await new Promise<void>((resolve) => {
		if (programChoices.targetEndpointTitles.length) resolve();

		rl.question('Enter endpoint title (replace spaces with "-"): ', (endpointTitle) => {
			programChoices.targetEndpointTitles = [ endpointTitle ];
			resolve();
		});
	});

	rl.close();
};


const promptForViewport = async () => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	await new Promise<void>((resolve) => {
		if (programChoices.targetViewports.length) resolve();

		rl.question('Enter viewport (e.g. 1920,1080, or iphone-6): ', (viewport) => {
			const parsedViewport = parseViewport(viewport as VisregViewport) || [];
			programChoices.targetViewports = [ parsedViewport as VisregViewport ];
			resolve();
		});
	});

	rl.close();
};

const startLabMode = async (programChoices: ProgramChoices) => {
	const { targetEndpointTitles, targetViewports } = programChoices;
	const requiredTargets = targetEndpointTitles.length && targetViewports.length;
		
	if (!requiredTargets) {
		printColorText('Lab mode requires both endpoint title and viewport to be specified\n', '2');

		await promptForEndpointTitle();
		await promptForViewport();

		if (!requiredTargets) {
			printColorText('Lab mode requires both endpoint title and viewport to be specified\n', '31');
			return;
		}
	}

	await runCypressTest();

	if (programChoices.gui) {
		process.exit();
	}

	printColorText(`Lab mode summary\n`, '4');
	printColorText(`Duration: ${cypressSummary.duration} seconds`, '2');
	printColorText('GUI: off', '2');
	printColorText(`Snapshots: ${programChoices.snap ? 'on' : 'off'}`, '2');

	printColorText(`\n(Tip: use the GUI for hot-reloading!)\n`, '2');

	process.exit();
}

const main = async (): Promise<void> => {
	await selectSuites();
	await selectType();

	const { testType } = programChoices;
	
	if (testType === 'lab') {
		startLabMode(programChoices);
		return;
	}

	if (testType === 'assess-existing-diffs') {
		assessExistingDiffImages(getAllDiffingFiles());
		return;
	}

	// Queue mode: run multiple suites sequentially
	if (isQueueMode()) {
		await runSuiteQueue();
		return;
	}

	// Single-suite mode (original behavior)
	if (testType === 'diffs-only') {
		exitIfNoDIffs();
	}

	const allCurrentDiffs = createTemporaryDiffList();
	backupDiffs();
	backupReceived();
	const testResultDiffs = await runCypressTest(allCurrentDiffs);

	if (testResultDiffs) {
		assessExistingDiffImages(testResultDiffs);
	}

	return;
};


const selectSuite = async () => {
	const suites: string[] = getSuites();

	if (suites.length === 0) {
		printColorText('No test suites found - see README', '31');
		process.exit(1);
	}

	if (suites.length === 1) {
		programChoices.suite = suites[ 0 ];
		return;
	}

	if (programChoices.suite && suites.includes(programChoices.suite)) {
		return;
	}

	console.log('Select suite:\n');
	suites.forEach((suite, index) => {
		console.log(`${index + 1} ${suite}`);
	});

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	await new Promise<void>((resolve) => {
		rl.question('\nEnter number of suite: ', (targetNum) => {
			programChoices.suite = suites[ parseInt(targetNum) - 1 ];
			resolve();
		});
	});

	rl.close();
};

const isQueueMode = () => {
	return !!(programChoices.allSuites || (programChoices.suites && programChoices.suites.length > 1));
};

/**
 * Resolve the suite queue. Populates programChoices.suites with the list of suites to run.
 * In single-suite mode, wraps the selected suite in an array for uniform handling.
 */
const selectSuites = async () => {
	const allSuites: string[] = getSuites();

	if (allSuites.length === 0) {
		printColorText('No test suites found - see README', '31');
		process.exit(1);
	}

	// --all-suites flag: run all discovered suites
	if (programChoices.allSuites) {
		programChoices.suites = allSuites;
		return;
	}

	// --suites flag: validate provided suite names
	if (programChoices.suites && programChoices.suites.length > 0) {
		const invalid = programChoices.suites.filter(s => !allSuites.includes(s));
		if (invalid.length > 0) {
			printColorText(`Unknown suite(s): ${invalid.join(', ')}`, '31');
			printColorText(`Available suites: ${allSuites.join(', ')}`, '2');
			process.exit(1);
		}
		return;
	}

	// Fall back to single-suite selection (existing behavior)
	await selectSuite();
	programChoices.suites = programChoices.suite ? [programChoices.suite] : [];
};

/**
 * Run multiple suites sequentially, accumulating diffs for assessment at the end.
 */
const runSuiteQueue = async (): Promise<void> => {
	const suites = programChoices.suites || [];
	const suiteResults: SuiteRunResult[] = [];

	printColorText(`\nQueue: running ${suites.length} suite(s) sequentially\n`, '36');

	for (let i = 0; i < suites.length; i++) {
		const suite = suites[i];
		resetForNextSuite();
		programChoices.suite = suite;

		printColorText(`\n${'─'.repeat(60)}`, '36');
		printColorText(`Suite ${i + 1}/${suites.length}: ${suite}`, '36');
		printColorText(`${'─'.repeat(60)}\n`, '36');

		if (programChoices.testType === 'diffs-only') {
			if (!pathExists(DIFF_DIR()) || !hasFiles(DIFF_DIR())) {
				printColorText(`No diffs found for suite "${suite}", skipping`, '2');
				suiteResults.push({ suite, diffs: [], failed: false });
				continue;
			}
		}

		const allCurrentDiffs = createTemporaryDiffList();
		backupDiffs();
		backupReceived();

		try {
			const testResultDiffs = await runCypressTest(allCurrentDiffs);
			suiteResults.push({
				suite,
				diffs: testResultDiffs || [],
				failed,
			});
		} catch (error) {
			printColorText(`Error running suite "${suite}": ${error}`, '31');
			suiteResults.push({ suite, diffs: [], failed: true });
		}
	}

	// Print combined queue summary
	summarizeSuiteQueue(suiteResults);

	// Collect all diffs across suites for assessment
	const allDiffs = suiteResults.flatMap(r => r.diffs);
	const anyFailed = suiteResults.some(r => r.failed);

	if (allDiffs.length > 0) {
		// Set suite to the first suite with diffs for the assessment UI context
		const firstSuiteWithDiffs = suiteResults.find(r => r.diffs.length > 0);
		if (firstSuiteWithDiffs) {
			programChoices.suite = firstSuiteWithDiffs.suite;
		}
		assessExistingDiffImages(allDiffs);
	} else {
		summarizeResultsAndQuit([], [], anyFailed);
	}
};

const selectType = async () => {
	const specifiedType = typesList.find(type => type.slug === programChoices.testType);
	if (specifiedType) {
		return;
	}

	console.log('\nSelect type of test:\n');
	typesList.forEach((type, index) => {
		if (programChoices.containerized) {
			if (type.slug === 'lab' || type.slug === 'assess-existing-diffs') return;
		}

		printColorText(`${index + 1} ${type.name}\x1b[2m - ${type.description}\x1b[0m`, '0');
	});

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	await new Promise<void>((resolve) => {
		rl.question('\nEnter number of type: ', (id) => {
			const slug = typesList[ parseInt(id) - 1 ].slug;
			programChoices.testType = slug;
			resolve();
		});
	});

	rl.close();
};

const prepareConfig = (diffList?: string[]) => {
	const suiteRoot = path.join(suitesDirectory, programChoices.suite || '');
	const suiteConfigPath = path.join(suiteRoot, 'visreg.config.json');

	let suiteConfig: ConfigurationSettings = {};

	if (pathExists(suiteConfigPath)) {
		const fileContent = fs.readFileSync(suiteConfigPath, 'utf-8');
		try {
			suiteConfig = JSON.parse(fileContent);
		} catch (e) { }
	}

	pathExists(suiteConfigPath) && printColorText(`\nSuite config: ${suiteConfigPath}`, '2');

	// Merge project config with suite config without mutating the project-level config
	visregConfig = { ...projectLevelConfig, ...suiteConfig };

	const {
		screenshotOptions,
		comparisonOptions,
		requestOptions,
		visitOptions,
		maxViewport,
		browser,
	} = visregConfig;

	const snapshotSettings: CypressScreenshotOptions & JestMatchImageSnapshotOptions = {
		failureThreshold: 0.001,
		failureThresholdType: 'percent',
		capture: 'fullPage',
		disableTimersAndAnimations: false,
		...screenshotOptions,
		...comparisonOptions,
	};

	const visitSettings: VisitSettings = {
		scrollDuration: 750,
		devicePixelRatio: 1,
		waitForNetworkIdle: true,
		...visitOptions,
	}

	const requestSettings: RequestSettings = {
		...requestOptions,
	};

	process.env.CYPRESS_VISREG_SETTINGS = JSON.stringify({ maxViewport });
	process.env.CYPRESS_SNAPSHOT_SETTINGS = JSON.stringify(snapshotSettings);
	process.env.CYPRESS_VISIT_SETTINGS = JSON.stringify(visitSettings);
	process.env.CYPRESS_REQUEST_SETTINGS = JSON.stringify(requestSettings);

	process.env.SEND_SUITE_CONF = 'false';

	const specPath = getSuiteDirOrFail(programChoices.suite);

	const testSettings: TestSettings = {
		testType: programChoices.testType,
		suite: programChoices.suite,
		diffList: diffList || [],
		targetViewports: programChoices.targetViewports,
		targetEndpointTitles: programChoices.targetEndpointTitles,
		noSnap: !programChoices.snap,
	};

	const labMode = programChoices.testType === 'lab';

	const nonOverridableSettings: NonOverridableSettings = {
		suitesDirectory,
		useRelativeSnapshotsDir: true,
		storeReceivedOnFailure: true,
		snapFilenameExtension: labMode ? '.lab' : '.base',
		customSnapshotsDir: labMode ? 'lab' : '',
	};

	process.env.CYPRESS_failOnSnapshotDiff = 'false';
	process.env.CYPRESS_updateSnapshots = labMode ? 'true' : 'false';
	process.env.CYPRESS_TEST_SETTINGS = Buffer.from(JSON.stringify(testSettings)).toString('base64');
	process.env.CYPRESS_NON_OVERRIDABLE_SETTINGS = JSON.stringify(nonOverridableSettings);

	return {
		specPath,
		browser,
	};
};

const getInitMessage = (labModeOn: boolean, browser?: string) => {
	let labModeText = '- lab mode';
	labModeText += programChoices?.gui ? ' (GUI)' : '';
	labModeText += !programChoices?.snap ? ' (no snapshot)' : '';

	if (labModeOn) {
		return `Starting Cypress ${labModeText}`;
	}

	return `Starting Cypress (${browser || defaultBrowser})`;
}

const runCypressTest = async (diffList?: string[]): Promise<string[] | void> => new Promise((resolve) => {
	const conf = prepareConfig(diffList);
	process.chdir(__dirname);
	const labModeOn = programChoices.testType === 'lab';
	
	const message = getInitMessage(labModeOn, conf.browser)
	printColorText(`\n${message}\n`, '2');
	
	let cypressCommand: string;

	if (labModeOn && programChoices.gui) {
		cypressCommand = 'npx cypress open --env HEADED=true';
	} else {
		cypressCommand = `npx cypress run --env CLI=true --spec "${conf.specPath}" ${conf.browser ? `--browser ${conf.browser}` : defaultBrowser}`;
	}

	const parts = cypressCommand.split(' ');
	const command = parts[ 0 ];
	const args = parts.slice(1);

	const child = spawn(`DEBUG=cypress ${command}`, args, { shell: true });

	child.stdout?.on('data', (data) => onTerminalDataOut(data, diffList));
	child.on('error', (error) => console.error(`exec error: ${error}`));
	child.on('close', (code) => {
		if (labModeOn) {
			resolve();
			return;
		}
	
		const testDiffList = onTerminalCypressClose();
		resolve(testDiffList);
	});
});

const onTerminalDataOut = (data: Buffer, diffList?: string[]) => {
	const dataString = data.toString()

	if (dataString.includes('✓')) {
		const passing = createPassingEndpointTestResult(dataString);
		endpointTestResults.passing.push(passing)

		printColorText(`${dataString}`, '32');
		return;
	} 

	const failedRegexp = new RegExp(`(\\d+\\)\\s*${programChoices.suite})`, 'g'); // e.g. 1) suiteSlug
	if (dataString.match(failedRegexp)) {		
		const { userTerminated, failingEndpoints } = createFailingEndpointTestResult(dataString, failedRegexp);
		userTerminatedTest = userTerminated;
		endpointTestResults.failing = [...endpointTestResults.failing, ...failingEndpoints];

		printColorText(`${dataString}`, '31');
		return;
	}

	const failedInline = new RegExp(`(\\d+\\)\\s*[\\w\\s-]+\\s*\\@\\s*[\\w\\s-]+)`, 'g'); // e.g. 1) Start page @ samsung-s10
	if (dataString.match(failedInline)) {
		printColorText(`${dataString}`, '31');
		return;
	}
	
	if (dataString.includes('visreg-test-agenda')) {
		if (!testAgenda.length) {
			if (programChoices.testType === 'diffs-only') {
				testAgenda = diffList?.map(diff => diff.replace('.diff.png', '')) || [];
				return;
			}

			testAgenda = parseAgenda(dataString);
		}
		return;
	}
	
	if (dataString.includes('Spec Ran')) {
		cypressSummary = parseCypressSummary(dataString);
		// console.log(`${data}`)
		printColorText(`${dataString}`, '2');
		return;
	}

	if (dataString.match(/Spec\s+Tests\s+Passing\s+Failing\s+Pending\s+Skipped/)) {
		// We don't want to show Cypress' summary because we interpret and summarize the results ourselves
		return;
	}

	console.log(`${dataString}`)
}

const onTerminalCypressClose = () => {
	endpointTestResults.skipped = getSkippedEndpoints(endpointTestResults, testAgenda);
	endpointTestResults.unchanged = getUnchangedEndpoints(endpointTestResults);

	const testDiffList = getDiffingFilesFromTestResult(); 
	restoreBackups();
	const allDiffList = getAllDiffingFiles();

	const summary = {
		name: 'visreg-summary',
		testType: programChoices.testType,
		testDiffList,
		allDiffList,
		userTerminatedTest,
		endpointTestResults,
		programChoices,
		cypressSummary,
		testAgenda,
		createdAt: new Date(),
		terminated: userTerminatedTest
	};

	printColorText(`\nTest duration: ${cypressSummary.duration} seconds\n`, '2');

	printColorText('\nTested:', '2');
	summary.testAgenda.forEach(testTitle => {
		printColorText(`${testTitle}`, '0');
	})

	if (summary.endpointTestResults.failing.length) {
		printColorText('\nError:', '2');
		summary.endpointTestResults.failing.forEach(endpoint => {
			printColorText(`${endpoint.testTitle}`, '31');
		})
	}

	if (testDiffList.length) {
		printColorText('\nDiffs:', '2');
		testDiffList.forEach(diff => {
			printColorText(`${diff}`, '33');
		})
	}

	if (summary.endpointTestResults.unchanged.length) {
		printColorText('\nNo change:', '2');
		summary.endpointTestResults.unchanged.forEach(endpoint => {
			printColorText(`${endpoint.testTitle}`, '32');
		})
	}

	return testDiffList;
};

const onDataOut = (data: Buffer, ws: WebSocket, diffList?: string[]) => {
	// Remove ASCII escape codes
	const dataString = data
		.toString()
		.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '');

	const dataPackage: DataPackage = {
		name: '',
		type: 'text',
		stdout: dataString,
		color: ''
	};

	if (dataString.includes('✓')) {
		const passing = createPassingEndpointTestResult(dataString);
		endpointTestResults.passing.push(passing)
		dataPackage.color = '#749C75';

		ws.send(JSON.stringify(dataPackage));
		return;
	} 

	const failedRegexp = new RegExp(`(\\d+\\)\\s*Suite: "${programChoices.suite}")`, 'g'); // e.g. 1) Suite: "suiteSlug"
	if (dataString.match(failedRegexp)) {
		const { userTerminated, failingEndpoints } = createFailingEndpointTestResult(dataString, failedRegexp);
		userTerminatedTest = userTerminated;
		endpointTestResults.failing = [...endpointTestResults.failing, ...failingEndpoints];
		return;
	}

	const failedInline = /^\s*(\d+\)\s*[\w\s-]+\s*\@\s*[\w\s-]+)/; // e.g. 1) Start page @ samsung-s10
	if (dataString.match(failedInline)) {
		dataPackage.color = '#FE4A49';

		ws.send(JSON.stringify(dataPackage));
		return;
	}
	
	if (dataString.includes('visreg-test-agenda')) {
		if (!testAgenda.length) {
			if (programChoices.testType === 'diffs-only') {
				testAgenda = diffList?.map(diff => diff.replace('.diff.png', '')) || [];
				return;
			}

			testAgenda = parseAgenda(dataString);	
		}
		return;
	}
	
	if (dataString.includes('Spec Ran')) {
		cypressSummary = parseCypressSummary(dataString);
		return;
	}

	if (dataString.match(/(Results)/)) {
		return;
	}

	if (dataString.match(/Spec\s+Tests\s+Passing\s+Failing\s+Pending\s+Skipped/)) {
		// We don't want to show Cypress' summary because we interpret and summarize the results ourselves
		return;
	}
		
	ws.send(JSON.stringify(dataPackage));
}

const onErrOut = (data: Buffer, ws: WebSocket) => {
	if (
		data.includes('DevTools listening on ws://127.0.0.1')
		|| data.includes('NSApplicationDelegate')
	) return;

	ws.send(JSON.stringify({ type: 'error', payload: `${data}` }));
}

const onCypressClose = (ws: WebSocket, resolve: () => void) => {
	endpointTestResults.skipped = getSkippedEndpoints(endpointTestResults, testAgenda);
	endpointTestResults.unchanged = getUnchangedEndpoints(endpointTestResults);
	
	const testDiffList = getDiffingFilesFromTestResult();
	restoreBackups();
	const allDiffList = getAllDiffingFiles();

	const summary = JSON.stringify({
		type: 'data',
		payload: {
			name: 'visreg-summary',
			testType: programChoices.testType,
			testDiffList,
			allDiffList,
			userTerminatedTest,
			endpointTestResults,
			programChoices,
			cypressSummary,
			testAgenda,
			createdAt: new Date(),
			terminated: userTerminatedTest,
		}
	});

	printColorText(`Test complete\n`, '2');
	ws.send(summary);
	resolve();
	return;
};

const runWebCypressTest = async (ws: WebSocket, diffList?: string[]): Promise<void> => new Promise((resolve, reject) => {
	const conf = prepareConfig(diffList);
	process.chdir(__dirname);

	const initMessage = `Starting Cypress (${conf.browser || defaultBrowser})`;

	printColorText(`\n${initMessage}\n`, '2');
	
	const initMessagePackage: DataPackage = {
		name: '',
		type: 'text',
		stdout: initMessage,
		color: '#7D7D7D'
	};

	ws.send(JSON.stringify(initMessagePackage));

	let cypressCommand: string;
	cypressCommand = `npx cypress run --spec "${conf.specPath}" ${conf.browser ? `--browser ${conf.browser}` : defaultBrowser}`;	

	const parts = cypressCommand.split(' ');
	const command = parts[ 0 ];
	const args = parts.slice(1);

	const child = spawn(`DEBUG=cypress ${command}`, args, { shell: true });

	child.stdout?.on('data', (data) => onDataOut(data, ws, diffList));
	child.stderr?.on('data', (data) => onErrOut(data, ws));
	
	child.on('error', (error) => console.log(`exec error: ${error}`));
	child.on('close', (code) => onCypressClose(ws, resolve));
});


const isNotTargetOfTest = (fileName: string) => {
	const res = !includedInTarget(fileName);
	return res;
}

const couldNotTest = (fileName: string, notTested: EndpointTestResult[]) => {
	if (notTested.length === 0) return false;

	const untested = notTested.some(endpoint => (
		fileName.includes(endpoint.endpointTitle) && fileName.includes(endpoint.viewport)
	));

	return untested;
};

const restoreBackups = () => {
	const backupDiffDir = BACKUP_DIFF_DIR();
	const backupReceivedDir = BACKUP_RECEIVED_DIR();

	const skipped = getSkippedEndpoints(endpointTestResults, testAgenda);
	const notTested = [...endpointTestResults.failing, ...skipped];	

	const restoreCondition = (fileName: string) => (
		isNotTargetOfTest(fileName) || couldNotTest(fileName, notTested)
	)

	if (pathExists(backupDiffDir)) {
		fs.readdirSync(backupDiffDir)
			.filter(restoreCondition)
			.forEach(fileName => {
				fs.renameSync(path.join(backupDiffDir, fileName), path.join(DIFF_DIR(), fileName));
			});
	}

	if (pathExists(backupReceivedDir)) {
		fs.readdirSync(backupReceivedDir)
			.filter(restoreCondition)
			.forEach(fileName => {
				fs.renameSync(path.join(backupReceivedDir, fileName), path.join(RECEIVED_DIR(), fileName));
			});
	}

	cleanUp();	
};

const exitIfNoDIffs = () => {
	if (programChoices.testType === 'lab') {
		process.exit();
	}

	if (!pathExists(DIFF_DIR()) || !hasFiles(DIFF_DIR())) {
		summarizeResultsAndQuit([], [], failed);
		process.exit();
	}
};

export const getDiffsForWeb = (suiteSlug: string, conf?: ConfigurationSettings) => {
	programChoices.suite = suiteSlug;
	programChoices.testType = 'assess-existing-diffs';
	programChoices.webTesting = true;

	visregConfig = conf || { ...projectLevelConfig };

	let files = getDiffingFilesFromTestResult();

	const diffFiles = files.map((file, index) => {
		return processImageViaWeb(file, index, files.length, suiteSlug);
	});

	return diffFiles;
};

const resetPreviousTest = () => {
	testAgenda = [];
	failed = false;
	cypressSummary = {};
	userTerminatedTest = false;

	programChoices.targetViewports = [];
	programChoices.targetEndpointTitles = [];
	
	endpointTestResults.passing = [];
	endpointTestResults.failing = [];
	endpointTestResults.skipped = [];
	endpointTestResults.unchanged = [];
}

/**
 * More thorough reset for multi-suite queue runs.
 * Resets all module-level state that could bleed between suite runs.
 */
const resetForNextSuite = () => {
	resetPreviousTest();

	// Reset working config to project-level defaults
	visregConfig = { ...projectLevelConfig };

	// Reset state in other modules
	resetWebAssessmentState();
	resetTerminalAssessmentState();
	resetSummaryState();
};

/**
 * Run a queue of suites via the web UI, streaming progress over WebSocket.
 */
export const startWebSuiteQueue = async (ws: WebSocket, suites: string[], testType: string, progChoices: Partial<ProgramChoices>, conf?: ConfigurationSettings) => {
	const suiteResults: SuiteRunResult[] = [];

	for (let i = 0; i < suites.length; i++) {
		const suite = suites[i];
		resetForNextSuite();

		programChoices.suite = suite;
		programChoices.testType = testType as any;
		programChoices.webTesting = true;

		visregConfig = conf || { ...projectLevelConfig };

		if (progChoices.testType === 'targetted') {
			const parsedViewports = progChoices.targetViewports
				? progChoices.targetViewports?.map(vp => parseViewport(vp as VisregViewport))
				: [];

			programChoices.targetViewports = parsedViewports || [];
			programChoices.targetEndpointTitles = progChoices.targetEndpointTitles || [];
		}

		// Notify frontend of queue progress
		ws.send(JSON.stringify({
			type: 'queue-progress',
			payload: { suite, index: i, total: suites.length, status: 'running' },
		}));

		if (programChoices.testType === 'diffs-only') {
			if (!pathExists(DIFF_DIR()) || !hasFiles(DIFF_DIR())) {
				ws.send(JSON.stringify({
					type: 'queue-progress',
					payload: { suite, index: i, total: suites.length, status: 'skipped' },
				}));
				suiteResults.push({ suite, diffs: [], failed: false });
				continue;
			}
		}

		const diffList = createTemporaryDiffList();
		backupDiffs();
		backupReceived();

		try {
			await runWebCypressTest(ws, diffList);
			const diffs = getDiffingFilesFromTestResult();
			suiteResults.push({ suite, diffs, failed });
		} catch (error) {
			suiteResults.push({ suite, diffs: [], failed: true });
		}

		ws.send(JSON.stringify({
			type: 'queue-progress',
			payload: { suite, index: i, total: suites.length, status: 'complete', diffs: suiteResults[suiteResults.length - 1].diffs },
		}));
	}

	// Send final queue summary
	const allDiffs = suiteResults.flatMap(r => r.diffs);
	ws.send(JSON.stringify({
		type: 'queue-complete',
		payload: { suiteResults, allDiffs },
	}));
};

export const startWebTest = async (ws: WebSocket, progChoices: Partial<ProgramChoices>, conf?: ConfigurationSettings) => {
	if (!progChoices.suite || !progChoices.testType) {
		return;
	}

	resetPreviousTest();

	programChoices.suite = progChoices.suite;
	programChoices.testType = progChoices.testType;
	programChoices.webTesting = true;

	visregConfig = conf || { ...projectLevelConfig };

	if (programChoices.testType === 'targetted') {
		const parsedViewports = progChoices.targetViewports
			? progChoices.targetViewports?.map(vp => parseViewport(vp as VisregViewport))
			: [];

		programChoices.targetViewports = parsedViewports  || [];
		programChoices.targetEndpointTitles = progChoices.targetEndpointTitles || [];
	}

	const diffList = createTemporaryDiffList();

	backupDiffs();
	backupReceived();
	await runWebCypressTest(ws, diffList);
};

const backupDiffs = () => {
	const dir = DIFF_DIR();
	const backupDir = BACKUP_DIFF_DIR();

	if (pathExists(dir) && hasFiles(dir)) {
		if (!pathExists(backupDir)) {
			fs.mkdirSync(backupDir);
		}

		const files = fs.readdirSync(dir);
		files.forEach(file => {
			fs.renameSync(path.join(dir, file), path.join(backupDir, file));
		});
	}
};

const backupReceived = () => {
	const dir = RECEIVED_DIR();
	const backupDir = BACKUP_RECEIVED_DIR();

	if (pathExists(dir) && hasFiles(dir)) {
		if (!pathExists(backupDir)) {
			fs.mkdirSync(backupDir);
		}

		const files = fs.readdirSync(dir);
		files.forEach(file => {
			fs.renameSync(path.join(dir, file), path.join(backupDir, file));
		});
	}
};

const createTemporaryDiffList = () => {
	if (!pathExists(DIFF_DIR())) return [];
	return fs.readdirSync(DIFF_DIR()).filter(file => file.endsWith('.diff.png'));
};

const selectWhereToAssess = async () => {
	console.log(`Press SPACE to assess diffs in the browser`);
	console.log('...or ENTER to continue in the terminal\n');

	const rl = readline.createInterface({
		input: process.stdin,
	});

	let answer;

	while (true) {
		answer = await new Promise(resolve => {
			// Enable raw mode to get individual keypresses
			readline.emitKeypressEvents(process.stdin);
			if (process.stdin.isTTY) process.stdin.setRawMode(true);

			process.stdin.on('keypress', (str, key) => {
				if (key.name === 'space') {
					resolve('web');
				}

				if (key.name === 'return') {
					resolve('cli');
				}

				if (key.ctrl && key.name === 'c') {
					process.exit();
				}
			});
		});

		if (answer === 'web' || answer === 'cli') {
			break;
		}
	}

	if (process.stdin.isTTY) process.stdin.setRawMode(false);
	rl.close();

	return answer;
};

const getTargetText = () => {
	if (!programChoices.targetViewports.length && !programChoices.targetEndpointTitles.length) {
		return '';
	}

	let targetText = ' from test (limited to ';

	targetText += programChoices.targetEndpointTitles.length
		? `"${programChoices.targetEndpointTitles.join(', ')}"`
		: '';

	targetText += programChoices.targetViewports.length
		? ' @ ' + programChoices.targetViewports.join(', ')
		: '';

	targetText += ')';

	return targetText;
};

const assessExistingDiffImages = async (files: string[]) => {
	if (programChoices.testType === 'lab') {
		process.exit();
	}

	if (files.length === 0) {
		summarizeResultsAndQuit([], [], failed);
		process.exit();
	}

	console.log('\n\n');

	const targetText = getTargetText();

	printColorText(`🚨 Detected ${files.length} diffs${targetText}\n`, '33');

	const answer = await selectWhereToAssess();

	if (answer === 'web') {
		assessInWeb({ files, failed });
		return;
	}

	if (programChoices.containerized) {
		printColorText(`Assess the changes by running: \x1b[4mnpx visreg-test -a ${programChoices.suite}\x1b[0m (i.e. not from the container)`, '33');
		return;
	}

	assessInCLI({ files, targetText, failed, visregConfig });
};


process.on('SIGINT', () => {
	// console.log('\n\nTerminated by user');
	// console.log('Restoring backups\n');
	restoreBackups();
	process.exit();
});

// Only start the server if the user has specified the --server-start flag (this is just as I'm working on it)
if (programChoices.serverStart) {
	startServer(programChoices);
} else {
	main();
}

