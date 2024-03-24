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

		if (isTypescript) {
			child = spawn(`cd ${suiteConfigDir} && npx tsx snaps.ts`, { shell: true, stdio: 'inherit' });
		} else {
			const snapsPath = path.join(suiteConfigDir, 'snaps.js');
			const mjsPath = path.join(suiteConfigDir, 'snaps.mjs');
			fs.copyFileSync(snapsPath, mjsPath);
			child = spawn(`cd ${suiteConfigDir} && node snaps.mjs`, { shell: true, stdio: 'inherit' });
		}

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
			}

			if (!isTypescript) {
				fs.unlinkSync(path.join(suiteConfigDir, 'snaps.mjs'));
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
