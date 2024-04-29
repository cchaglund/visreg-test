import { getDiffsForWeb } from '../../../visreg';
import { DiffObject, Image, Summary, processImageViaWeb } from '../../../diff-assessment-web';
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

type TemporaryAssessmentResults = DiffObject[];

let temporaryAssessmentResults: TemporaryAssessmentResults = [];

router.post('/approve-instantly', async (req: any, res: any) => {
    const { suiteSlug, fileName } = req.body

    const diffImage = processImageViaWeb(fileName, 0, 1, suiteSlug);

    try {        
        approveImage(diffImage, req.local.suitesDirectory);
        res.send({ success: true });
    } catch (error) {
        console.error('Error approving instantly: ', error);
        res.send({ error: 'Error approving instantly' });
    }
});

router.post('/approve', (req: any, res: any) => {
    const diffImage: DiffObject = req.body.diffImage;

    try {
        const assessedImage = {
            ...diffImage,
            assessedAs: 'approved',
        }

        temporaryAssessmentResults[assessedImage.index] = assessedImage;
        res.send(temporaryAssessmentResults);
    } catch (error) {
        console.error('Error temporarily approving file: ', error);
        res.send({ error: 'Error temporarily approving file' });
    }
});

router.post('/reject', (req: any, res: any) => {
    const diffImage: DiffObject = req.body.diffImage;

    try {
        const assessedImage = {
            ...diffImage,
            assessedAs: 'rejected',
        }
        
        temporaryAssessmentResults[assessedImage.index] = assessedImage;
        res.send(temporaryAssessmentResults);
    } catch (error) {
        console.error('Error temporarily rejecting file: ', error);
        res.send({ error: 'Error temporarily rejecting file' });
    }
})

const resetSummary = () => {
    summary.suiteSlug = '';
    summary.approvedFiles = [];
    summary.rejectedFiles = [];
    summary.failed = false;

    temporaryAssessmentResults = [];
}

router.post('/diffs-data', (req: any, res: any) => {    
    const { suiteSlug, diffListSubset, resume } = req.body;
    const suiteSlugToUse = suiteSlug || req.local.programChoices.suite;

    
    
    if (!resume) {
        resetSummary();
    }

    if (!suiteSlug) {
        return res.send({ error: 'No suite slug provided' });
    }

    summary.suiteSlug = suiteSlugToUse;

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
            diffFiles: diffs,
            temporaryAssessmentResults,
        });
    } catch (error) {
        console.error('Error getting diff files: ', error);
        res.send({ error: 'Error getting diff files' });
    }
});

const finalizeAssessment = async (suitesDirectory: string) => {    
    return new Promise<void>((resolve) => {
        temporaryAssessmentResults
            .filter((diffImage) => diffImage.assessedAs === 'rejected')
            .forEach((diffImage) => {
                const { imageName } = diffImage;
                summary.rejectedFiles.push(imageName);
            });
        
        temporaryAssessmentResults
            .filter((diffImage) => diffImage.assessedAs === 'approved')
            .forEach((diffImage) => {
                approveImage(diffImage, suitesDirectory)
            });

        resolve();
    });
};

const approveImage = (diffImage: DiffObject, suitesDirectory: string) => {
    try {
        const { imageName, files, suite } = diffImage;
        const { baseline, received, diff } = files;
        const { baselines, diffs, receivedImages } = getSuiteImageDirectories(suite, suitesDirectory);

        fs.unlinkSync(path.join(baselines, baseline.fileName));
        fs.renameSync(path.join(receivedImages, received.fileName), path.join(baselines, baseline.fileName));
        fs.unlinkSync(path.join(diffs, diff.fileName));

        summary.approvedFiles.push(imageName);
    } catch (error) {
        console.error('Error approving file: ', error);
    }
}


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

