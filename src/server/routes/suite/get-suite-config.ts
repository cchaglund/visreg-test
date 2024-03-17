import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { getSuiteDirOrFail, printColorText } from '../../../utils';
const express = require('express');
const router = express.Router();


const suiteConfigCache = new Map<string, any>();

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
			child = spawn(`cd ${suiteConfigDir} && npx ts-node --transpile-only snaps.ts`, { shell: true, stdio: 'inherit' });
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

router.post('/receive-suite-config', (req: any, res: any) => {
    const { testConfig, suiteName } = req.body;
    suiteConfigCache.set(suiteName, testConfig);
    res.send('ok');
});

router.post('/get-suite-config', async (req: any, res: any) => {
    const { suiteName } = req.body;

    if (suiteConfigCache.has(suiteName)) {
        res.send(suiteConfigCache.get(suiteName));
        return;
    }

    await runSuiteConfig(suiteName);
    res.send(suiteConfigCache.get(suiteName));
});


export default router;
