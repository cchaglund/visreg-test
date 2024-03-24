import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { getSuiteDirOrFail, printColorText } from '../../utils';
import { TestConfig } from '../../types';

const suiteConfigCache = new Map<string, TestConfig>();

const runSuiteConfig = async (suiteName: string): Promise<void> => {	
    if (!suiteName) {
        printColorText('runSuiteConfig: No suite path - see README', '31');
        return;
    }

	process.env.SEND_SUITE_CONF = 'true';
	process.env.SUITE_NAME = suiteName;
	
	return new Promise((resolve, reject) => {
        const suiteConfigDir = getSuiteDirOrFail(suiteName)
		const isTypescript = fs.existsSync(path.join(suiteConfigDir, 'snaps.ts'));
		let child;
		
		// I think I can use this for both prod and dev, but pathToCypressContextWrapperSafe I definitely can
		// const pathToCypressContextWrapperSafe = './node_modules/visreg-test/dist/server/services/run-snaps-in-cypress-context.js';
		const pathToCypressContextWrapper = path.join(__dirname, 'run-snaps-in-cypress-context.js');

		child = spawn(`npx tsx ${pathToCypressContextWrapper}`, {
			shell: true,
			stdio: 'inherit',
			env: {
				...process.env,
				SUITE_CONFIG_DIR: suiteConfigDir,
				FILE_TYPE: isTypescript ? 'ts' : 'js',
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

export const setSuiteConfigCache = (suiteName: string, testConfig: TestConfig) => {
	suiteConfigCache.set(suiteName, testConfig);
}

export const fetchSuiteConfig = async (suiteName: string) => {
	if (suiteConfigCache.has(suiteName)) {
        return suiteConfigCache.get(suiteName);
    }

    await runSuiteConfig(suiteName);
	return suiteConfigCache.get(suiteName);
}
