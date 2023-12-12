#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';
import * as readline from 'readline';
import { delimiter } from './shared';
import { TestType } from './types.d';

const projectDir = process.cwd();
process.env.PROJECT_DIR = projectDir;

let clean_target_name = "";
let approvedFiles: string[] = [];
let rejectedFiles: string[] = [];
let diffFiles = [];

const SUITE_SNAPS_DIR = () => path.join(projectDir, clean_target_name, 'snapshots', 'snaps');
const DIFF_DIR = () => path.join(SUITE_SNAPS_DIR(), '__diff_output__');
const RECEIVED_DIR = () => path.join(SUITE_SNAPS_DIR(), '__received_output__');

const typesList: TestType[] = [
	{
		name: 'Full',
		slug: 'test-all',
		description: 'Run a full visual regression test of all endpoints and viewports (previous diffs are deleted)'
	},
	{
		name: 'Retest diffs only',
		slug: 'retest-diffs-only',
		description: 'Run only the tests which failed in the last run'
	},
	{
		name: 'Assess diffs',
		slug: 'assess-existing-diffs',
		description: 'Assess the existing diffs (no tests are run)'
	}
];


// Function to print color text
const printColorText = (text: string, colorCode: string): void => {
	console.log(`\x1b[${ colorCode }m${ text }\x1b[0m`);
};

// Print header
printColorText('\n _  _  __  ____  ____  ____  ___ \n/ )( \\(  )/ ___)(  _ \\(  __)/ __)\n\\ \\/ / )( \\___ \\ )   / ) _)( (_ \\ \n \\__/ (__)(____/(__\\_)(____)\\___/\n', '36;1');


// Main function
const main = async (): Promise<void> => {
	const selectedTargetName = await selectTarget();
	clean_target_name = selectedTargetName;

	const { slug: testTypeSlug } = await selectType();

	
	if (testTypeSlug === 'test-all') {
		fullRegressionTest(selectedTargetName, testTypeSlug);
	}

	if (testTypeSlug === 'retest-diffs-only') {
		diffsOnly(selectedTargetName, testTypeSlug);
	}

	if (testTypeSlug === 'assess-existing-diffs') {
		assessExistingDiffs();
	}
};

// Function to get directories in the suites directory
const getDirectories = (source: string): string[] =>
	fs.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);


const configPath = path.join(projectDir, 'visreg.config.json');
let testDirectory = projectDir;
let ignoreDirectories: string[] = [ 'node_modules' ];

if (fs.existsSync(configPath)) {
	const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	
	if (config.testDirectory) {
		testDirectory = path.isAbsolute(config.testDirectory) ? config.testDirectory : path.resolve(projectDir, config.testDirectory);
	}
	if (config.ignoreDirectories) {
		ignoreDirectories.push(...config.ignoreDirectories);
	}
}

const targets: string[] = getDirectories(testDirectory)
	.filter(dirName => !ignoreDirectories.includes(dirName));

const selectTarget = async (): Promise<string> => {
	if (targets.length === 0) {
		printColorText('No test targets found - see README', '31');
		process.exit(1);
	}

	let selectedTargetName: string = "";
	if (targets.length === 1) {
		selectedTargetName = targets[ 0 ];
	} else {
		console.log('Select target:\n');
		targets.forEach((target, index) => {
			console.log(`${index + 1} ${target}`);
		});

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		selectedTargetName = await new Promise((resolve) => {
			rl.question('\nEnter the number of the target you want to select: ', (targetNum) => {
				resolve(targets[ parseInt(targetNum) - 1 ]);
			});
		});

		rl.close();
	}

	return selectedTargetName;
};

const selectType = async (): Promise<TestType> => {
	console.log('Select type:\n');
	typesList.forEach((type, index) => {
		console.log(`${index + 1} ${type.name} - ${type.description}`);
	});

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	const selectedTest: TestType = await new Promise((resolve) => {
		rl.question('\nEnter the number of the type you want to select: ', (id) => {
			resolve(typesList[ parseInt(id) - 1 ]);
		});
	});

	rl.close();

	return selectedTest;
};

const runCypressTest = async (target: string, type: string, diffListString?: string): Promise<void> => {
	printColorText(`\nStarting Cypress\n`, '2');
    return new Promise((resolve, reject) => {
		const specPath = path.join(projectDir, target, 'snaps.cy.js');
		
		const gui = process.argv.includes('--gui');

		let encodedDiff = '';
		if (diffListString) {
			encodedDiff = Buffer.from(diffListString).toString('base64');
		}
		
		const envs = [
			`testType=${type}`,
			'failOnSnapshotDiff=false',
			`target=${target}`,
			`diffListString=${diffListString ? encodedDiff : 'false'}`,
			`projectDir=${projectDir}`
		];		

		let cypressCommand: string
		if (gui) {
			printColorText('Running in GUI mode - Assessment of eventual diffs must be done manually', '2')
			cypressCommand = `npx cypress open --env ${envs.join(',')}`;
		} else {
			process.chdir(__dirname); // __dirname is the directory where the current file is located
			// cypressCommand = `../node_modules/.bin/cypress run --spec "${specPath}" --env ${envs.join(',')} `; // when run as a locally-installed module
			cypressCommand = `npx cypress run --spec "${specPath}" --env ${envs.join(',')} `; // when run as an npm package
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
            if (code !== 0) {
                reject(new Error(`child process exited with code ${code}`));
            } else {
                resolve();
            }
        });
	});
};

const exitIfNoDIffs = () => {
	if (!fs.existsSync(DIFF_DIR()) || fs.readdirSync(DIFF_DIR()).length === 0) {
		printColorText('🎉  Visual regression passed! (No diffs found)', '32');
		process.exit();
	}
}

const fullRegressionTest = async (selectedTargetName: string, testTypeSlug: string) => {
	remove_diffs();
	remove_received();
	await runCypressTest(selectedTargetName, testTypeSlug);
	assessExistingDiffImages();

}

const diffsOnly = async (selectedTargetName: string, testTypeSlug: string) => {
	exitIfNoDIffs();

    const diffListString = createTemporaryDiffList();
    remove_diffs();
    remove_received();
	await runCypressTest(selectedTargetName, testTypeSlug, diffListString);
    assessExistingDiffImages();
}

const assessExistingDiffs = () => {
    assessExistingDiffImages();
}


const remove_diffs = () => {
	const dir = DIFF_DIR();
    if (fs.existsSync(dir) && fs.readdirSync(dir)?.length) {
		fs.rm(dir, { recursive: true }, (err) => { console.log(err) });
    }
}

const remove_received = () => {
	const dir = RECEIVED_DIR();
    if (fs.existsSync(dir) && fs.readdirSync(dir).length) {
		fs.rm(dir, { recursive: true }, (err) => { console.log(err) });
    }
}

const createTemporaryDiffList = () => {
	if (!fs.existsSync(DIFF_DIR())) {
		return '';
	}

	diffFiles = fs.readdirSync(DIFF_DIR()).filter(file => file.endsWith('.diff.png'));
	return diffFiles.join(delimiter);
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
	printColorText(`\n${imageName}\x1b[2m - ${index}/${total}\x1b[0m`, '4');

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

			console.log(`\x1b[2mENTER to approve, SPACEBAR to reject, R to reopen image \x1b[0m`);
        });

        if (process.platform === 'linux') {
            execSync(`pkill -f "${path.join(DIFF_DIR(), imageFile)}"`);
        }

        if (answer === 'approve') {
            approvedFiles.push(imageName);
			printColorText('✅  Approved changes\x1b[2m - updating baseline\x1b[0m', '32')

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
			
			printColorText('Rejected changes\x1b[2m - run test again after fixing\x1b[0m', '33');
            break;
        }
    }

    rl.close();
    console.log('\n');
}

const assessExistingDiffImages = async () => {
	console.log('\n\n');

	exitIfNoDIffs();
	printColorText(`🚨  Detected ${fs.readdirSync(DIFF_DIR()).length} diffs, opening preview \x1b[2m- takes a couple of seconds\x1b[0m\n\n`, '31');

    const files = fs.readdirSync(DIFF_DIR()).filter(file => file.endsWith('.diff.png'));

	for (const [index, file] of files.entries()) {
		await processImage(file, index, files.length);
	}

    if (process.platform === 'darwin') {
        execSync(`osascript -e 'quit app "Preview"'`);
    }

	printColorText('Done!\n\n', '1');

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

	printColorText(`\nTotal files: ${approvedFiles.length + rejectedFiles.length}`, '2');
	printColorText(`Total approved: ${approvedFiles.length}`, '32');
	printColorText(`Total rejected: ${rejectedFiles.length}`, '31');

    if (rejectedFiles.length > 0) {		
		printColorText('\n\n⚠️  You rejected some changes - \x1b[2mrun this test again after making the necessary fixes in order to update the baseline images.\x1b[0m', '33');
    }
}

process.on('SIGINT', () => {
    process.stdin.removeAllListeners('keypress');
    process.exit();
});

main();
