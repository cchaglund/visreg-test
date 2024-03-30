import { getSuites } from '../../../utils';
import * as path from 'path';
const express = require('express');
const router = express.Router();

const suites = getSuites();

suites.forEach((suiteDir: string) => {
    router.get(`/${suiteDir}/:fileName`, (req: any, res: any) => {
        res.set({
            'Content-Type': 'text/plain',
            'Content-Disposition': 'inline'
        });

        const file = path.join(req.allSuitesDir, suiteDir, req.params.fileName);
        res.sendFile(file);
    });
});

export default router;
