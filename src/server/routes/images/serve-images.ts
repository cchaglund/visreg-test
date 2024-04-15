import { getFilesInDir } from '../../../utils';
import { getSuites } from '../../../utils';
import * as path from 'path';
const express = require('express');
const router = express.Router();

const suites = getSuites();

suites.forEach((suiteDir: string) => {
    router.get(`/${suiteDir}/diff/:imageName`, (req: any, res: any) => {
        const image = path.join(req.local.suitesDirectory, suiteDir, 'snapshots/snaps/__diff_output__', req.params.imageName);        
        res.sendFile(image);
    });

    router.get(`/${suiteDir}/baseline/:imageName`, (req: any, res: any) => {
        const image = path.join(req.local.suitesDirectory, suiteDir, 'snapshots/snaps', req.params.imageName);
        res.sendFile(image);
    });

    router.get(`/${suiteDir}/received/:imageName`, (req: any, res: any) => {
        const image = path.join(req.local.suitesDirectory, suiteDir, 'snapshots/snaps/__received_output__', req.params.imageName);
        res.sendFile(image);
    });
});

export default router;
