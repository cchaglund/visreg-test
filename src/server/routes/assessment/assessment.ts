import { getDiffsForWeb } from '../../../visreg';
import { DiffObject, Summary } from '../../../diff-assessment-web';
import { cleanUp } from '../../../utils';
import * as fs from 'fs';
import * as path from 'path';
import { getSuiteImageDirectories } from '../../services/get-suite-image-directories';

const express = require('express');
const router = express.Router();

const summary: Summary = {
    suiteSlug: '',
    approvedFiles: [],
    rejectedFiles: [],
    duration: 0,
    failed: false,
}

router.post('/approve', (req: any, res: any) => {
    const diffImage: DiffObject = req.body.diffImage;

    const { imageName, files, suite} = diffImage;
    const { baseline, received, diff } = files;
    const { baselines, diffs, receivedImages } = getSuiteImageDirectories(suite, req);

    try {
        fs.unlinkSync(path.join(baselines, baseline.fileName));
        fs.renameSync(path.join(receivedImages, received.fileName), path.join(baselines, baseline.fileName));
        fs.unlinkSync(path.join(diffs, diff.fileName));
    
        summary.approvedFiles.push(imageName);

        res.send({ success: true });
    } catch (error) {
        console.error('Error approving file: ', error);
        res.send({ error: 'Error approving file' });
    }
});

router.post('/reject', (req: any, res: any) => {
    const diffImage: DiffObject = req.body.diffImage;
    const { imageName } = diffImage;

    try {
        summary.rejectedFiles.push(imageName);
    
        res.send({ success: true });
    } catch (error) {
        console.error('Error rejecting file: ', error);
        res.send({ error: 'Error rejecting file' });
    }
});

router.post('/diffs-data', (req: any, res: any) => {
    const suiteSlug = req.body.suiteSlug || req.programChoices.suite;

    if (!suiteSlug) {
        return res.send({ error: 'No suite slug provided' });
    }

    summary.suiteSlug = suiteSlug;

    try {
        const diffs = getDiffsForWeb(suiteSlug);
        
        res.send({ 
            suiteSlug: suiteSlug,
            diffFiles: diffs
        });
    } catch (error) {
        console.error('Error getting diff files: ', error);
        res.send({ error: 'Error getting diff files' });
    }
});


router.get('/summary', (req: any, res: any) => {
    try {
        cleanUp();
    
        const summaryCopy = { ...summary };

        summary.suiteSlug = '';
        summary.approvedFiles = [];
        summary.rejectedFiles = [];
        summary.duration = 0;
        summary.failed = false;
        
        res.send(summaryCopy);
    } catch (error) {
        console.error('Error getting summary: ', error);
        res.send({ error: 'Error getting summary' });
    }
});


export default router;

