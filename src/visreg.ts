#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as readline from 'readline';
import { ConfigurationSettings, NonOverridableSettings, TestType } from './types';
import { programChoices } from './cli';
import startServer from './server';
import { assessInWeb } from './diff-assessment-web';
import { BACKUP_DIFF_DIR, BACKUP_RECEIVED_DIR, DIFF_DIR, RECEIVED_DIR, cleanUp, getDiffingFiles, getSuiteDirOrFail, getSuites, hasFiles, includedInSpecification, isSpecifiedTest, parsedViewport, pathExists, printColorText, projectRoot, removeBackups, suitesDirectory } from './utils';
import { assessInCLI } from './diff-assessment-terminal';
import { summarizeResultsAndQuit } from './summarize';

const configPath = path.join(projectRoot, 'visreg.config.json');
let visregConfig: ConfigurationSettings = {};

if (pathExists(configPath)) {
	const fileContent = fs.readFileSync(configPath, 'utf-8');
	try {
		visregConfig = JSON.parse(fileContent);
	} catch (e) {}
}

let start: number;
let duration: number;
let failed = false;

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

const getVersion = () => {
	// Read the "version" field from package.json and print it out:
	const packageJsonPath = path.join(__dirname, '..', 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8') || '{}');
	return packageJson.version;
}

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
		if (programChoices.endpointTitle) resolve();

		rl.question('Enter endpoint title: ', (endpointTitle) => {
			programChoices.endpointTitle = endpointTitle;
			resolve();
		});
	})

	rl.close();
}


const promptForViewport = async () => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	await new Promise<void>((resolve) => {
		if (programChoices.viewport) resolve();

		rl.question('Enter viewport (e.g. 1920,1080, or iphone-6): ', (viewport) => {
			programChoices.viewport = parsedViewport(viewport);
			resolve();
		});
	})
	
	rl.close();
}

const main = async (): Promise<void> => {
	await selectSuite();
	await selectType();

	const { testType } = programChoices;
	
	if (testType === 'full-test') {
		fullRegressionTest();
		return;
	}

	if (testType === 'diffs-only') {
		diffsOnly();
		return;
	}

	if (testType === 'assess-existing-diffs') {
		assessExistingDiffs();
		return;
	}

	if (!programChoices.viewport || !programChoices.endpointTitle) {	
		const testName = testType === 'lab' ? 'Lab' : 'Targetted';
		printColorText(`${testName} mode requires both endpoint title and viewport to be specified\n`, '2');

		await promptForEndpointTitle();
		await promptForViewport();

		if (!programChoices.viewport || !programChoices.endpointTitle) {
			printColorText(`${testName} mode requires both endpoint title and viewport to be specified\n`, '31');
			return;
		}
	}

	if (testType === 'lab') {
		runCypressTest();
		return
	} 

	targettedTest();
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

const prepareConfig = () => {
	const suiteRoot = path.join(suitesDirectory, programChoices.suite || '');
	const suiteConfigPath = path.join(suiteRoot, 'visreg.config.json');

	let suiteConfig: ConfigurationSettings = {};

	if (pathExists(suiteConfigPath)) {
		const fileContent = fs.readFileSync(suiteConfigPath, 'utf-8');
		try {
			suiteConfig = JSON.parse(fileContent);
		} catch (e) {}
	}

	pathExists(suiteConfigPath) && printColorText(`\nSuite config: ${suiteConfigPath}`, '2');

	Object.assign(visregConfig, suiteConfig);

	const { 
		screenshotOptions,
		comparisonOptions,
		...conf
	} = visregConfig;
	
	const snapshotSettings = {
		failureThreshold: 0.001,
		failureThresholdType: 'percent',
		capture: 'fullPage',
		disableTimersAndAnimations: false,
		scrollDuration: 750,
		devicePixelRatio: 1,
		disableAutoPreviewClose: false,
		imagePreviewProcess: 'eog',
		waitForNetworkIdle: true,
		...screenshotOptions,
		...comparisonOptions,
		...conf,
	}
	
	process.env.CYPRESS_VISREG_OPTIONS = JSON.stringify(conf)
	process.env.CYPRESS_SNAPSHOT_SETTINGS = JSON.stringify(snapshotSettings);
	process.env.PROGRAM_CHOICES = JSON.stringify(programChoices);
	process.env.SEND_SUITE_CONF = 'false';

	return snapshotSettings;
}

const runCypressTest = async (diffList: string[] = []): Promise<void> => {
	const conf = prepareConfig();

	start = Date.now();
	const labModeOn = programChoices.testType === 'lab';

	let labModeText = '- lab mode';
	labModeText += programChoices?.gui ? ' (GUI)' : '';
	labModeText += !programChoices?.snap ? ' (no snapshot)' : '';

	if (labModeOn) {
		printColorText(`\nStarting Cypress ${ labModeText } \n`, '2');
	} else {
		// Only electron currently supported in docker
		programChoices.containerized
			? printColorText(`\nStarting Cypress (electron) \n`, '2')
			: printColorText(`\nStarting Cypress (${ conf.browser || 'electron' }) \n`, '2')
	}

    return new Promise((resolve, reject) => {
		const specPath = getSuiteDirOrFail(programChoices.suite);
		
		const testSettings = {
			testType: programChoices.testType,
			suite: programChoices.suite,
			diffList,
			viewport: programChoices.viewport,
			endpointTitle: programChoices.endpointTitle,
			noSnap: !programChoices.snap,
		}

		const nonOverridableSettings: NonOverridableSettings = {
			suitesDirectory,
			useRelativeSnapshotsDir: true,
			storeReceivedOnFailure: true,
			snapFilenameExtension: labModeOn ? '.lab' : '.base',
			customSnapshotsDir: labModeOn ? 'lab' : '',
		};

		process.env.CYPRESS_failOnSnapshotDiff = 'false';
		process.env.CYPRESS_updateSnapshots = labModeOn ? 'true' : 'false';
		process.env.CYPRESS_TEST_SETTINGS = Buffer.from(JSON.stringify(testSettings)).toString('base64');
		process.env.CYPRESS_NON_OVERRIDABLE_SETTINGS = JSON.stringify(nonOverridableSettings);		

		process.chdir(__dirname); 
		let cypressCommand: string		
		
		if (labModeOn && programChoices.gui) {
			cypressCommand = 'npx cypress open';
		} else {
			if (programChoices.containerized) {
				// Only electron is currently supported in docker
				cypressCommand = `npx cypress run --spec "${specPath}"`;
			} else {
				cypressCommand = `npx cypress run --spec "${specPath}" ${conf.browser ? `--browser ${conf.browser}` : ''}`;
			}
		}

		const parts = cypressCommand.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        const child = spawn(`DEBUG=cypress ${command}`, args, { shell: true, stdio: 'inherit' });

		child.on('data', (data) => console.log(`${data}`));
		child.on('error', (error) => console.error(`exec error: ${error}`));
		child.on('close', (code) => {
			if (labModeOn) resolve();
			
			if (isSpecifiedTest() && code === 0) {
				/**
				 * Restore the files which were not specified in the test. 
				 * Why not just omit them from the backup in the first place? Because we need to remove 
				 * all the files from diff and received folders before running the test (so that cypress 
				 * can do clean comparisons).
				 */
				const unaffectedFiles = (fileName: string) => !includedInSpecification(fileName);
				restoreFromBackup(unaffectedFiles);
				resolve();
			}

            if (code !== 0) {
				failed = true;

				console.log('\n\n');
				console.log('------------------');
				console.log('\n');
				
				printColorText('Cypress could not complete one or more tests (see above for details) - run targetted tests on these', '33');

				if (programChoices.testType === 'diffs-only') {
					printColorText('\nDiffs-only testing requires all tests to be successes. Any failure results in the diffs being restored. Fix the issues or remove the offending diff files from the diff directory.', '33');
					restoreFromBackup();
					process.exit(1);
				}

				resolve()
            }

			// Images have been created, so we can remove the backups
			removeBackups();

			duration = Math.round((Date.now() - start) / 1000);
			resolve();
		});
	});
};

// const filterForErrors = (stdout: string) => {
// 	const failingLine = stdout.indexOf('failing');
// 	if (failingLine === -1) return;

// 	const resultsLine = stdout.indexOf('(Results)');
// 	const failingEndpoints = stdout.substring(failingLine, resultsLine);
// 	const errorLines = failingEndpoints.split('\n');

// 	const failingTests: string[] = []

// 	errorLines.forEach((line, index) => {
// 		if (line.includes('Error')) {
// 			failingTests.push(errorLines[index - 1]);
// 		}
// 	})

// 	failingTests.forEach((text) => {
// 		printColorText(text, '31');
// 	});
// };


const restoreFromBackup = (restoreCondition: (fileName: string) => boolean = () => true) => {
	const backupDiffDir = BACKUP_DIFF_DIR();
	const backupReceivedDir = BACKUP_RECEIVED_DIR();

	if (pathExists(backupDiffDir)) {
		fs.readdirSync(backupDiffDir)
			.filter(restoreCondition) // restore the files which were not specified in the test
			.forEach(fileName => {
				fs.renameSync(path.join(backupDiffDir, fileName), path.join(DIFF_DIR(), fileName));
			});
	}

	if (pathExists(backupReceivedDir)) {
		fs.readdirSync(backupReceivedDir)
			.filter(restoreCondition) // restore the files which were not specified in the test
			.forEach(fileName => {
				fs.renameSync(path.join(backupReceivedDir, fileName), path.join(RECEIVED_DIR(), fileName));
			});
	}

	cleanUp();
}

const exitIfNoDIffs = () => {
	if (programChoices.testType === 'lab') {
		process.exit();
	}
	
	if (!pathExists(DIFF_DIR()) || !hasFiles(DIFF_DIR())) {
		summarizeResultsAndQuit([], [], failed, duration);
		process.exit();
	}
}

const fullRegressionTest = async () => {
	if (pathExists(DIFF_DIR())) {
		fs.rmSync(DIFF_DIR(), { recursive: true });
	}
	
	if (pathExists(RECEIVED_DIR())) {
		fs.rmSync(RECEIVED_DIR(), { recursive: true });
	}

	await runCypressTest();
	assessExistingDiffImages();
}

const diffsOnly = async () => {
	exitIfNoDIffs();

    const diffList = createTemporaryDiffList();
    backupDiffs();
    backupReceived();
	await runCypressTest(diffList);
    assessExistingDiffImages();
}

const assessExistingDiffs = () => {
    assessExistingDiffImages();
}

const targettedTest = async () => {
	const diffList = createTemporaryDiffList();
	backupDiffs();
	backupReceived();
	await runCypressTest(diffList);
    assessExistingDiffImages();
}

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
}

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
}

const createTemporaryDiffList = () => {
	if (!pathExists(DIFF_DIR())) return [];
	return fs.readdirSync(DIFF_DIR()).filter(file => file.endsWith('.diff.png'));
}


const assessExistingDiffImages = async () => {
	exitIfNoDIffs();
	let files = getDiffingFiles();

	if (files.length === 0) {
		summarizeResultsAndQuit([], [], failed, duration);
	}

	console.log('\n\n');

	const targetText = programChoices.viewport || programChoices.endpointTitle
		? ` (scoped to ${programChoices.endpointTitle ? `"${programChoices.endpointTitle}"` : ''}${programChoices.viewport ? `@${programChoices.viewport}` : ''})`
		: '';

	printColorText(`🚨 Detected ${files.length} diffs${targetText}\n`, '33');
	
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

	if (answer === 'web') {
		assessInWeb({files, duration, failed});
		return;
	}

	if (programChoices.containerized) {
		printColorText(`Assess the changes by running: \x1b[4mnpx visreg-test -a ${programChoices.suite}\x1b[0m (i.e. not from the container)`, '33');
		return;
	}

	assessInCLI({files, targetText, duration, failed, visregConfig});
}


process.on('SIGINT', () => {
	if (programChoices.testType !== 'diffs-only') {
		process.exit();
	};

	console.log('\n\nTerminated by user, restoring backups\n');
	restoreFromBackup();
	process.exit();
});

// Only start the server if the user has specified the --server-start flag (this is just as I'm working on it)
if (programChoices.serverStart) {
	startServer(programChoices);
} else {
	main();
}

