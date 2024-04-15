import { getFilesInDir } from '../../../utils';
import { getSuites } from '../../../utils';
import * as path from 'path';
const express = require('express');
const router = express.Router();

const suites = getSuites();

suites.forEach((suiteDir: string) => {
    router.get(`/list/${suiteDir}/diff-list`, (req: any, res: any) => {
        const diffDir = path.join(req.local.suitesDirectory, suiteDir, 'snapshots/snaps/__diff_output__');
        const files = getFilesInDir(diffDir);
        res.send(files);
    });

    router.get(`/list/${suiteDir}/baseline-list`, (req: any, res: any) => {
        const baselineDir = path.join(req.local.suitesDirectory, suiteDir, 'snapshots/snaps');
        const files = getFilesInDir(baselineDir);
        res.send(files);
    });

    router.get(`/list/${suiteDir}/received-list`, (req: any, res: any) => {
        const receivedDir = path.join(req.local.suitesDirectory, suiteDir, 'snapshots/snaps/__received_output__');
        const files = getFilesInDir(receivedDir);
        res.send(files);
    });
});

export default router;
