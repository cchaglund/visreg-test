import { getDiffsForWeb } from '../../../visreg';
import { DiffObject, Summary, processImageViaWeb } from '../../../diff-assessment-web';
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
    failed: false,
}

type TemporaryAssessmentData = {
    approvedFiles: DiffObject[];
    rejectedFiles: DiffObject[];
};

const temporaryAssessmentData: TemporaryAssessmentData = {
    approvedFiles: [],
    rejectedFiles: [],
};


router.post('/approve', (req: any, res: any) => {
    const diffImage: DiffObject = req.body.diffImage;

    try {        
        temporaryAssessmentData.approvedFiles.push(diffImage);
    
        res.send({ success: true });
    } catch (error) {
        console.error('Error temporarily approving file: ', error);
        res.send({ error: 'Error temporarily approving file' });
    }
});

router.post('/reject', (req: any, res: any) => {
    const diffImage: DiffObject = req.body.diffImage;

    try {
        temporaryAssessmentData.rejectedFiles.push(diffImage);
    
        res.send({ success: true });
    } catch (error) {
        console.error('Error temporarily rejecting file: ', error);
        res.send({ error: 'Error temporarily rejecting file' });
    }
});


const resetSummary = () => {
    summary.suiteSlug = '';
    summary.approvedFiles = [];
    summary.rejectedFiles = [];
    summary.failed = false;

    temporaryAssessmentData.approvedFiles = [];
    temporaryAssessmentData.rejectedFiles = [];
}

router.post('/diffs-data', (req: any, res: any) => {
    resetSummary();
    const suiteSlug = req.body.suiteSlug || req.local.programChoices.suite;
    const { diffListSubset } = req.body;

    if (!suiteSlug) {
        return res.send({ error: 'No suite slug provided' });
    }

    summary.suiteSlug = suiteSlug;

    try {
        let diffs = [];

        if (diffListSubset) {            
            diffs = diffListSubset.map((file: string, index: number) => {
                return processImageViaWeb(file, index, diffListSubset.length, suiteSlug);
            });
        } else {
            diffs = getDiffsForWeb(suiteSlug);
        }        
        
        res.send({ 
            suiteSlug: suiteSlug,
            diffFiles: diffs
        });
    } catch (error) {
        console.error('Error getting diff files: ', error);
        res.send({ error: 'Error getting diff files' });
    }
});

const finalizeAssessment = async (suitesDirectory: string) => {    
    return new Promise<void>((resolve) => {
        const { approvedFiles, rejectedFiles } = temporaryAssessmentData;
     
        rejectedFiles.forEach((diffImage) => {
            const { imageName } = diffImage;
            summary.rejectedFiles.push(imageName);
        });

        approvedFiles.forEach((diffImage) => {
            const { imageName, files, suite } = diffImage;
            const { baseline, received, diff } = files;
            const { baselines, diffs, receivedImages } = getSuiteImageDirectories(suite, suitesDirectory);

            try {
                fs.unlinkSync(path.join(baselines, baseline.fileName));
                fs.renameSync(path.join(receivedImages, received.fileName), path.join(baselines, baseline.fileName));
                fs.unlinkSync(path.join(diffs, diff.fileName));

                summary.approvedFiles.push(imageName);
            } catch (error) {
                console.error('Error approving file: ', error);
            }
        });

        resolve();
    });
};


router.get('/summary', async (req: any, res: any) => {
    try {
        await finalizeAssessment(req.local.suitesDirectory);
        cleanUp();
    
        const summaryCopy = { ...summary };

        summary.suiteSlug = '';
        summary.approvedFiles = [];
        summary.rejectedFiles = [];
        summary.failed = false;
        
        res.send(summaryCopy);
    } catch (error) {
        console.error('Error getting summary: ', error);
        res.send({ error: 'Error getting summary' });
    }
});


export default router;

