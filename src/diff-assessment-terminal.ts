import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import { DIFF_DIR, RECEIVED_DIR, SUITE_SNAPS_DIR, getHumanReadableFileSize, printColorText } from './utils';
import { ConfigurationSettings } from './types';
import { summarizeResultsAndQuit } from './summarize';

let approvedFiles: string[] = [];
let rejectedFiles: string[] = [];
let visregConfig: ConfigurationSettings;

type CliAssessmentArgs = {
	files: string[];
	targetText: string;
	failed: boolean;
	visregConfig: ConfigurationSettings;
}

export const assessInCLI = async (args: CliAssessmentArgs) => {
	const { files, failed, visregConfig: config } = args;

	visregConfig = config;

	printColorText(`Opening image preview \x1b[2m- takes a couple of seconds\x1b[0m\n\n`, '33');

	for (const [index, file] of files.entries()) {
		await processImage(file, index, files.length);
	}

	closeImagePreview();
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

	summarizeResultsAndQuit(approvedFiles, rejectedFiles, failed);
}

const processImage = async (imageFile: string, index: number, total: number) => {
    const imageName = imageFile.replace('.diff.png', '');

	const pathToRecievedFile = path.join(RECEIVED_DIR(), imageName + '-received.png');
	const recievedSize = getHumanReadableFileSize(pathToRecievedFile);

	printColorText(`${imageName}\x1b[2m - ${recievedSize} - ${index + 1}/${total}\x1b[0m`, '4');

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
			if (key.ctrl && key.name === 'c') {
				closeImagePreview();
				process.exit();
			} else if (key.name === 'r') {
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

const closeImagePreview = () => {
	if (process.platform === 'win32') return;
	if (visregConfig.disableAutoPreviewClose) return;

    try {
		const darwin = `osascript -e 'quit app "Preview"'`;
		const linux = `pkill ${visregConfig.imagePreviewProcess}`;
		execSync(process.platform === 'darwin' ? darwin : linux);
    } catch (error) {
        console.error('Failed to close image preview:', error);
		console.log('------------------')
		console.log('Linux users, you have some options:');
		console.log('- Specify the process name of your image previewer in visreg.config.json (imagePreviewProcess) so that it can be closed automatically');
		console.log('- Set disableAutoPreviewClose to true in visreg.config.json to prevent the warning message (you will have to close the image previewer manually');
		console.log('- Install Gnome Image Viewer (eog) and set it as your default image previewer');	
    }
}

const openImage = (imageFile: string) => {
    if (process.platform === 'darwin') {
        execSync(`open -g "${path.join(DIFF_DIR(), imageFile)}"`);
    } else {
        execSync(`xdg-open "${path.join(DIFF_DIR(), imageFile)}"`);
    }
}
