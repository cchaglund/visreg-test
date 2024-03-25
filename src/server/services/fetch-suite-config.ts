import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { getSuiteDirOrFail, printColorText } from '../../utils';
import { TestConfig } from '../../types';
import { serverPort } from '../config';

let suiteName = '';
let snapsFilePath = '';
let fileName = '';

const suiteConfigCache = new Map<string, TestConfig>();

const runSuiteConfig = async (): Promise<void> => {	
    if (!suiteName) {
        printColorText('runSuiteConfig: No suite path - see README', '31');
        return;
    }

	process.env.SEND_SUITE_CONF = 'true';

	const suiteConfigDir = getSuiteDirOrFail(suiteName);
	const isTypescript = fs.existsSync(path.join(suiteConfigDir, 'snaps.ts'));
	fileName = isTypescript ? 'snaps.ts' : 'snaps.js';
	snapsFilePath = path.join(suiteConfigDir, fileName);

	return new Promise((resolve, reject) => {
		let child;
		
		// I think I can use this for both prod and dev, but pathToCypressContextWrapperSafe I definitely can
		// const pathToCypressContextWrapperSafe = './node_modules/visreg-test/dist/server/services/run-snaps-in-cypress-context.js';
		const pathToCypressContextWrapper = path.join(__dirname, 'run-snaps-in-cypress-context.js');

		child = spawn(`npx tsx ${pathToCypressContextWrapper}`, {
			shell: true,
			stdio: 'inherit',
			env: {
				...process.env,
				FILE_PATH: snapsFilePath,
			}
		});

		child.on('data', (data) => console.log(`${data}`));
		child.on('error', (error) => {
            console.error(`exec error: ${error}`)
            reject();
        });
		child.on('close', (code) => {
			// At this point the snaps.ts/js file has been run, making a POST request to /receive-suite-config, thereby setting the suiteConfigCache
			if (code !== 0) {
				printColorText('Error getting suite test configuration', '33');
				reject();
				return;
			}

			resolve();
		});
	});
}

export const setSuiteConfigCache = (testConfig: TestConfig) => {
	const parsedTestConfig = {
		...testConfig,
		suiteName,
		snapsFilePath,
		snapsFileUrl: `http://localhost:${serverPort}/files/${suiteName}/snapsfile/${fileName}`,
	}
	
	suiteConfigCache.set(suiteName, parsedTestConfig);
}

export const fetchSuiteConfig = async (incomingSuiteName: string) => {
	if (suiteConfigCache.has(incomingSuiteName)) {
        return suiteConfigCache.get(incomingSuiteName);
    }

	suiteName = incomingSuiteName;

    await runSuiteConfig();
	return suiteConfigCache.get(suiteName);
}
