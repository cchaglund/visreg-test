#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';
import * as readline from 'readline';
import { ConfigurationSettings, NonOverridableSettings, TestType } from './types';
import { Command } from 'commander';

const program = new Command();

program
	.option('-s, --suite <char>')
	.option('-e, --endpoint-title <char>')
	.option('-v, --viewport <char>')
	.option('-f, --full-test [specs]')
	.option('-d, --diffs-only [specs]')
	.option('-a, --assess-existing-diffs [specs]')
	.option('-lab, --lab [specs]')
	.option('-no-gui, --no-gui')

program.parse();

type ProgramChoices = {
	suite?: string,
	endpointTitle?: string,
	viewport?: string | number[],
	fullTest?: boolean | string,
	diffsOnly?: boolean | string,
	assessExistingDiffs?: boolean | string,
	lab?: boolean,
	testType?: string,
	gui?: boolean,
}

const parsedViewport = (viewport?: string | number[]) => {	
	if (!viewport) {
		return;
	}

	const stringedViewport = viewport.toString();
	if (!stringedViewport?.includes(',')) {
		return viewport;
	}

	return stringedViewport.split(',').map((pixels: string) => parseInt(pixels))
}

const extractProgramChoices = () => {	
	const opts: ProgramChoices = program.opts();

	let testType = '';
	let specificationShorthand: string | boolean = '';

	switch (true) {
		case opts.assessExistingDiffs !== undefined:
			testType = 'assess-existing-diffs';
			specificationShorthand = opts.assessExistingDiffs;
			break;
		case opts.lab !== undefined:
			testType = 'lab';
			specificationShorthand = opts.lab;
			break;
		case opts.diffsOnly !== undefined:
			testType = 'diffs-only';
			specificationShorthand = opts.diffsOnly;
			break;
		case opts.fullTest !== undefined:
			testType = 'full-test';
			specificationShorthand = opts.fullTest;
			break;
	}
	
    const args: ProgramChoices = {
		suite: opts?.suite,
		endpointTitle: opts?.endpointTitle,
        viewport: parsedViewport(opts?.viewport),
		testType,
		gui: opts?.gui,
    };

    if (typeof specificationShorthand !== 'string') {
		return args;
	}

	return extractSpecificationShorthand(args, specificationShorthand);
}

const extractSpecificationShorthand = (args: ProgramChoices, specificationShorthand: string) => {	
	const shortSpec = specificationShorthand;
    const colonPosition = shortSpec.indexOf(':');
    const atPosition = shortSpec.indexOf('@') === -1 ? shortSpec.length : shortSpec.indexOf('@');	

    let suite = '';
    let endpointTitle = '';

    if (colonPosition > 0) {
        suite = shortSpec.substring(0, colonPosition);
        endpointTitle = shortSpec.substring(colonPosition + 1, atPosition);
    } else if (colonPosition === -1) {
		suite = shortSpec.substring(0, atPosition);
    } else {		
        endpointTitle = shortSpec.substring(1, atPosition);
    }

    const viewport = parsedViewport(shortSpec.substring(atPosition + 1, shortSpec.length));

    const updatedArgs = {
		...args,
		suite: args.suite || suite,
        endpointTitle : args.endpointTitle || endpointTitle,
        viewport : args.viewport || viewport,
    }

    return updatedArgs;
}


const programChoices: ProgramChoices = extractProgramChoices();
process.env.PROGRAM_CHOICES = JSON.stringify(programChoices);

const pathExists = (dirPath: string) => fs.existsSync(dirPath);

const hasFiles = (dirPath: string) => fs.readdirSync(dirPath).length > 0;

const removeDirIfEmpty = (dirPath: string) => {
    if (!pathExists(dirPath) || hasFiles(dirPath)) {
		return;
	}

	fs.rm(dirPath, { recursive: true }, (err) => {
		if (err) console.error(err);
	});
}


const printColorText = (text: string, colorCode: string) => {
	console.log(`\x1b[${ colorCode }m${ text }\x1b[0m`);
};

const projectRoot = process.cwd();
const configPath = path.join(projectRoot, 'visreg.config.json');
const visregConfig: ConfigurationSettings = pathExists(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

const { 
	screenshotOptions,
	comparisonOptions,
	...conf
} = visregConfig;

process.env.CYPRESS_VISREG_OPTIONS = JSON.stringify(conf)

const snapshotSettings = {
	failureThreshold: 0.02,
	failureThresholdType: 'percent',
	capture: 'fullPage',
	disableTimersAndAnimations: false,
	scrollDuration: 1000,
	...screenshotOptions,
	...comparisonOptions,
}

process.env.CYPRESS_SNAPSHOT_SETTINGS = JSON.stringify(snapshotSettings);

if (pathExists(configPath)) {
	printColorText(`\nLoaded config ${configPath}`, '2');
}

let approvedFiles: string[] = [];
let rejectedFiles: string[] = [];

const SUITE_SNAPS_DIR = () => path.join(projectRoot, programChoices.suite || '', 'snapshots', 'snaps');
const DIFF_DIR = () => path.join(SUITE_SNAPS_DIR(), '__diff_output__');
const BACKUP_DIFF_DIR = () => path.join(SUITE_SNAPS_DIR(), 'backup-diffs');
const RECEIVED_DIR = () => path.join(SUITE_SNAPS_DIR(), '__received_output__');
const BACKUP_RECEIVED_DIR = () => path.join(SUITE_SNAPS_DIR(), 'backup-received');

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

// Print header
printColorText('\n _  _  __  ____  ____  ____  ___ \n/ )( \\(  )/ ___)(  _ \\(  __)/ __)\n\\ \\/ / )( \\___ \\ )   / ) _)( (_ \\ \n \\__/ (__)(____/(__\\_)(____)\\___/\n', '36;1');

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

// Main function
const main = async (): Promise<void> => {
	await selectSuite();
	await selectType();

	const { testType } = programChoices;

	if (testType === 'lab') {
		if (!programChoices.viewport || !programChoices.endpointTitle) {
			printColorText('Lab mode requires both endpoint title and viewport to be specified\n', '2');

			await promptForEndpointTitle();
			await promptForViewport();

			if (!programChoices.viewport || !programChoices.endpointTitle) {
				printColorText('Lab mode requires both endpoint title and viewport to be specified', '31');
				return;
			}
		}

		runCypressTest();
	}
	
	if (testType === 'full-test') {
		fullRegressionTest();
	}

	if (testType === 'diffs-only') {
		diffsOnly();
	}

	if (testType === 'assess-existing-diffs') {
		assessExistingDiffs();
	}
};

// Function to get directories in the suites directory
const getDirectories = (source: string): string[] =>
	fs.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);



const selectSuite = async () => {
	let testDirectory = projectRoot;
	let ignoreDirectories: string[] = [ 'node_modules' ];
	
	if (visregConfig.testDirectory) {
		testDirectory = path.isAbsolute(visregConfig.testDirectory) ? visregConfig.testDirectory : path.resolve(projectRoot, visregConfig.testDirectory);
	}
	if (visregConfig.ignoreDirectories) {
		ignoreDirectories.push(...visregConfig.ignoreDirectories);
	}

	const suites: string[] = getDirectories(testDirectory)
		.filter(dirName => !ignoreDirectories.includes(dirName))
		.filter(dirName => {
			const fileName = 'snaps';
			return (
				fs.existsSync(path.join(testDirectory, dirName, fileName + '.js')) ||
				fs.existsSync(path.join(testDirectory, dirName, fileName + '.ts'))
			);
		})

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

	console.log('Suites:\n');
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
		return specifiedType.slug;
	}
	
	console.log('Types of test:\n');
	typesList.forEach((type, index) => {
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

const getSpecPath = () => {
	if (!programChoices.suite) {
		return;
	}

	const specDir = path.join(projectRoot, programChoices.suite);

	if (fs.existsSync(specDir)) {
		return specDir;
	}

	const files = fs.readdirSync(specDir);
	const snapsFile = files.find(file => file.startsWith('snaps'));
	if (snapsFile) {
		return path.join(specDir, snapsFile);
	}
	
	printColorText('No test suites found - see README', '31');
	process.exit(1);
};

const isSpecifiedTest = () => !!(programChoices.viewport || programChoices.endpointTitle);

const runCypressTest = async (diffList: string[] = []): Promise<void> => {
	const labModeOn = programChoices.testType === 'lab';

	printColorText(`\nStarting Cypress ${labModeOn ? 'in lab mode' : '' }\n`, '2');

    return new Promise((resolve, reject) => {
		const specPath = getSpecPath();
		
		const testSettings = {
			testType: programChoices.testType,
			suite: programChoices.suite,
			diffList,
			viewport: programChoices.viewport,
			endpointTitle: programChoices.endpointTitle,
		}

		const nonOverridableSettings: NonOverridableSettings = {
			projectRoot,
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
			cypressCommand = `npx cypress run --spec "${specPath}"`;
		}

		const parts = cypressCommand.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        const child = spawn(`DEBUG=cypress ${command}`, args, { shell: true, stdio: 'inherit' });

        child.on('data', (data) => {
			console.log(`${data}`);
        });

        child.on('error', (error) => {
            // console.error(`exec error: ${error}`);
        });

        child.on('close', (code) => {
			let msg = '';

			if (isSpecifiedTest() && code === 0) {
				/**
				 * Restore the files which were not specified in the test. 
				 * Why not just omit them from the backup in the first place? Because we need to remove 
				 * all the files from diff and received folders before running the test (so that cypress 
				 * can do clean comparisons).
				 */
				const unaffectedFiles = (fileName: string) => !includedInSpecification(fileName);
				restoreFromBackup(unaffectedFiles);
			}

            if (code !== 0) {
				restoreFromBackup();
				let msg = `Child process exited with code ${code}.`;
				msg += diffList ? `\nDiff list: ${diffList.join()}.` : '';
            }

			cleanUp();
			code === 0 ? resolve() : reject(new Error(msg));
        });
	});
};


const cleanUp = () => {
	pathExists(BACKUP_DIFF_DIR()) && fs.rmSync(BACKUP_DIFF_DIR(), { recursive: true });
	pathExists(BACKUP_RECEIVED_DIR()) && fs.rmSync(BACKUP_RECEIVED_DIR(), { recursive: true });

	removeDirIfEmpty(DIFF_DIR());
	removeDirIfEmpty(RECEIVED_DIR());
}

const includedInSpecification = (fileName: string) => {
	if (!programChoices.viewport && !programChoices.endpointTitle) {
		return true;
	}

	let viewportScreeningPassed = true
	let endpointScreeningPassed = true

	if (programChoices.viewport) {
		const viewportString = programChoices.viewport?.toString();
		viewportScreeningPassed = fileName.includes(viewportString);
	}

	if (programChoices.endpointTitle) {
		endpointScreeningPassed = fileName.includes(programChoices.endpointTitle);
	}	
	
	return viewportScreeningPassed && endpointScreeningPassed;
}

const restoreFromBackup = (restoreCondition: (fileName: string) => boolean = () => true) => {
	const backupDiffDir = BACKUP_DIFF_DIR();
	const backupReceivedDir = BACKUP_RECEIVED_DIR();

	if (pathExists(backupDiffDir)) {
		fs.readdirSync(backupDiffDir)
			.filter(restoreCondition)
			.forEach(fileName => {
				// restore the files which were not specified in the test
				fs.renameSync(path.join(backupDiffDir, fileName), path.join(DIFF_DIR(), fileName));
			});
	}

	if (pathExists(backupReceivedDir)) {
		fs.readdirSync(backupReceivedDir)
			.filter(restoreCondition)
			.forEach(fileName => {
				// restore the files which were not specified in the test
				fs.renameSync(path.join(backupReceivedDir, fileName), path.join(RECEIVED_DIR(), fileName));
			});
	}
}

const exitIfNoDIffs = () => {
	if (programChoices.testType === 'lab') {
		process.exit();
	}
	
	if (!pathExists(DIFF_DIR()) || !hasFiles(DIFF_DIR())) {
		printColorText('🎉  Visual regression passed! (No diffs found)', '32');
		process.exit();
	}
}

const fullRegressionTest = async () => {
	remove_diffs();
	remove_received();
	await runCypressTest();
	assessExistingDiffImages();
}

const diffsOnly = async () => {
	exitIfNoDIffs();

    const diffList = createTemporaryDiffList();
    remove_diffs();
    remove_received();
	await runCypressTest(diffList);
    assessExistingDiffImages();
}

const assessExistingDiffs = () => {
    assessExistingDiffImages();
}


const remove_diffs = () => {
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

const remove_received = () => {
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


const openImage = (imageFile: string) => {
    if (process.platform === 'darwin') {
        execSync(`open -g "${path.join(DIFF_DIR(), imageFile)}"`);
    } else {
        execSync(`xdg-open "${path.join(DIFF_DIR(), imageFile)}"`);
    }
}

const processImage = async (imageFile: string, index: number, total: number) => {
    const imageName = imageFile.replace('.diff.png', '');
	printColorText(`${imageName}\x1b[2m - ${index + 1}/${total}\x1b[0m`, '4');

    openImage(imageFile);

    const rl = readline.createInterface({
        input: process.stdin,
    });

    while (true) {
        const answer = await new Promise(resolve => {
			// Enable raw mode to get individual keypresses
			readline.emitKeypressEvents(process.stdin);
			if (process.stdin.isTTY) process.stdin.setRawMode(true);

			// Listen for keypress event
			process.stdin.on('keypress', (str, key) => {
			if (key.name === 'r') {
				resolve('reopen');
				process.stdin.removeAllListeners('keypress');
			} else if (key.name === 'space') {
				resolve('reject');
				process.stdin.removeAllListeners('keypress');
			} else if (key.name === 'return') {
				resolve('approve');
				process.stdin.removeAllListeners('keypress');
			}
			});

			printColorText('ENTER to approve, SPACEBAR to reject, R to reopen image', '2');
        });

        if (process.platform === 'linux') {
            execSync(`pkill -f "${path.join(DIFF_DIR(), imageFile)}"`);
        }

        if (answer === 'approve') {
            approvedFiles.push(imageName);
			console.log('✅');

            const baselineName = `${imageName}.base.png`;
            const receivedName = `${imageName}-received.png`;

            fs.unlinkSync(path.join(SUITE_SNAPS_DIR(), baselineName));
            fs.renameSync(path.join(RECEIVED_DIR(), receivedName), path.join(SUITE_SNAPS_DIR(), baselineName));
            fs.unlinkSync(path.join(DIFF_DIR(), imageFile));

            break;
        } else if (answer === 'reopen') {
            openImage(imageFile);
        } else if (answer === 'reject') {
            rejectedFiles.push(imageName);
			console.log('❌');
			
            break;
        }
    }

    rl.close();
    console.log('\n');
}

const assessExistingDiffImages = async () => {
	console.log('\n\n');

	exitIfNoDIffs();

	let files = fs.readdirSync(DIFF_DIR())
		.filter(file => {
			if (isSpecifiedTest()) {
				return includedInSpecification(file)
			}

			return true;
		})
		.filter(file => file.endsWith('.diff.png'));

	if (files.length === 0) {
		printColorText('🎉  Visual regression passed! (No diffs found)', '32');
		process.exit();
	}

	printColorText(`🚨 Detected ${files.length} diffs, opening preview \x1b[2m- takes a couple of seconds\x1b[0m\n\n`, '33');
		

	for (const [index, file] of files.entries()) {
		await processImage(file, index, files.length);
	}

    if (process.platform === 'darwin') {
        execSync(`osascript -e 'quit app "Preview"'`);
    }

	printColorText('Done!\n', '1');

    if (approvedFiles.length > 0) {
		printColorText('\nApproved:', '2');
        for (const file of approvedFiles) {
			printColorText(file, '32')
        }
    }

    if (rejectedFiles.length > 0) {
		printColorText('\nRejected:', '2');
        for (const file of rejectedFiles) {
			printColorText(file, '31')
        }
    }

	printColorText('\n\nSummary', '4');
	printColorText(`Total: ${approvedFiles.length + rejectedFiles.length}`, '2');

	if (approvedFiles.length > 0) {
		printColorText(`Approved: ${approvedFiles.length} - \x1b[32mbaselines have been updated\x1b[0m`, '2');
	} else {
		printColorText(`Approved: ${approvedFiles.length}`, '2');
	}

	if (rejectedFiles.length > 0) {
		printColorText(`Rejected: ${rejectedFiles.length} - \x1b[31mrun test again after making changes\x1b[0m`, '2');
	} else {
		printColorText(`Rejected: ${rejectedFiles.length}`, '2');
	}
}

process.on('SIGINT', () => {
	restoreFromBackup();
	cleanUp();
    process.stdin.removeAllListeners('keypress');

    process.exit();
});

main();


