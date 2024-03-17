import { serverPort } from '../../../server/config';
import { getCleanName, getFileInfo, getFileType, getHumanReadableFileSize, pathExists } from '../../../utils';
import * as path from 'path';

const express = require('express');
const router = express.Router();

router.get('/file/:suiteSlug/:fileName', (req: any, res: any) => {
    const { suiteSlug, fileName } = req.params;
    const suiteImagesDir = path.join(req.allSuitesDir, suiteSlug, 'snapshots/snaps');

    const cleanName = getCleanName(fileName);

    const baselinePath = path.join(suiteImagesDir, cleanName + '.base.png');
    const receivedPath = path.join(suiteImagesDir, '__received_output__', cleanName + '-received.png');
    const diffPath = path.join(suiteImagesDir, '__diff_output__', cleanName + '.diff.png');

    const type = getFileType(fileName);
    let filePath = '';
    
    if (type === 'diff') {
        filePath = diffPath
    } else if (type === 'received') {
        filePath = receivedPath;
    } else {
        filePath = baselinePath;
    }
    
    const { createdAt, modifiedAt } = getFileInfo(filePath);

    const siblingPaths = [];

    if (pathExists(baselinePath)) {
        siblingPaths.push({
            type: 'baseline',
            previewUrl: `/suite/${suiteSlug}/files/baseline/${cleanName}.base.png`
        });
    }

    if (pathExists(diffPath)) {
        siblingPaths.push({
            type: 'diff',
            previewUrl: `/suite/${suiteSlug}/files/diff/${cleanName}.diff.png`
        });
    }

    if (pathExists(receivedPath)) {
        siblingPaths.push({
            type: 'received',
            previewUrl: `/suite/${suiteSlug}/files/received/${cleanName}-received.png`
        });
    }

    const file = {
        suiteName: suiteSlug,
        name: cleanName,
        fileName: fileName,
        createdAt,
        modifiedAt,
        type,
        sizeString: getHumanReadableFileSize(filePath),
        fileUrl: `http://localhost:${serverPort}/files/${suiteSlug}/${type}/${fileName}`,
        path: filePath,
        siblingPaths,
    }

    res.send(file);
});


export default router;

