import { getFilesInDir } from '../../../utils';
import { getSuites } from '../../../utils';
import * as path from 'path';
const express = require('express');
const router = express.Router();

const suites = getSuites();

suites.forEach((suiteDir: string) => {
    router.get(`/${suiteDir}/diff/:imageName`, (req: any, res: any) => {
        const image = path.join(req.allSuitesDir, suiteDir, 'snapshots/snaps/__diff_output__', req.params.imageName);
        res.sendFile(image);
    });
    router.get(`/list/${suiteDir}/diff-list`, (req: any, res: any) => {
        const diffDir = path.join(req.allSuitesDir, suiteDir, 'snapshots/snaps/__diff_output__');
        const files = getFilesInDir(diffDir);
        res.send(files);
    });

    router.get(`/${suiteDir}/baseline/:imageName`, (req: any, res: any) => {
        const image = path.join(req.allSuitesDir, suiteDir, 'snapshots/snaps', req.params.imageName);
        res.sendFile(image);
    });
    router.get(`/list/${suiteDir}/baseline-list`, (req: any, res: any) => {
        const baselineDir = path.join(req.allSuitesDir, suiteDir, 'snapshots/snaps');
        const files = getFilesInDir(baselineDir);
        res.send(files);
    });

    router.get(`/${suiteDir}/received/:imageName`, (req: any, res: any) => {
        const image = path.join(req.allSuitesDir, suiteDir, 'snapshots/snaps/__received_output__', req.params.imageName);
        res.sendFile(image);
    });
    router.get(`/list/${suiteDir}/received-list`, (req: any, res: any) => {
        const receivedDir = path.join(req.allSuitesDir, suiteDir, 'snapshots/snaps/__received_output__');
        const files = getFilesInDir(receivedDir);
        res.send(files);
    });

    router.get(`/${suiteDir}/snapsfile/:imageName`, (req: any, res: any) => {
        res.set({
            'Content-Type': 'text/plain',
            'Content-Disposition': 'inline'
        });

        const image = path.join(req.allSuitesDir, suiteDir, req.params.imageName);
        res.sendFile(image);
    });
});

export default router;
