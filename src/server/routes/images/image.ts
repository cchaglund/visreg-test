import { serverPort } from '../../config';
import { getFileNameWithoutExtension, getFileInfo, getFileType, getHumanReadableFileSize, pathExists } from '../../../utils';
import * as path from 'path';
import { Endpoint } from '../../../types';
import { fetchSuiteConfig } from '../../services/fetch-suite-config';

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const imageCache = new Map<string, any>();

router.get('/image/:suiteSlug/:fileName', async (req: any, res: any) => {
    const { suiteSlug, fileName } = req.params;

    const hash = crypto.createHash('md5').update(suiteSlug + fileName).digest('hex');
    if (imageCache.has(hash)) {
        res.send(imageCache.get(hash));
        return;
    }

    const suiteImagesDir = path.join(req.local.suitesDirectory, suiteSlug, 'snapshots/snaps');

    const cleanName = getFileNameWithoutExtension(fileName);

    const baselinePath = path.join(suiteImagesDir, cleanName + '.base.png');
    const receivedPath = path.join(suiteImagesDir, '__received_output__', cleanName + '-received.png');
    const diffPath = path.join(suiteImagesDir, '__diff_output__', cleanName + '.diff.png');

    const type = getFileType(fileName);
    let filePath = '';

    if (type === 'diff') {
        filePath = diffPath;
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
            previewUrl: `/suite/${suiteSlug}/images/baseline/${cleanName}.base.png`
        });
    }

    if (pathExists(diffPath)) {
        siblingPaths.push({
            type: 'diff',
            previewUrl: `/suite/${suiteSlug}/images/diff/${cleanName}.diff.png`
        });
    }

    if (pathExists(receivedPath)) {
        siblingPaths.push({
            type: 'received',
            previewUrl: `/suite/${suiteSlug}/images/received/${cleanName}-received.png`
        });
    }

    const suiteConfig = await fetchSuiteConfig(suiteSlug);
    const endpoint = suiteConfig?.endpoints.find((endpoint: Endpoint) => {
        return endpoint.title === cleanName.slice(0, cleanName.indexOf(' @'));
    });

    const fullUrl = (suiteConfig?.baseUrl || '') + (endpoint?.path || '');

    const image = {
        suiteName: suiteSlug,
        name: cleanName,
        fileName: fileName,
        createdAt,
        modifiedAt,
        type,
        sizeString: getHumanReadableFileSize(filePath),
        fileUrl: `http://localhost:${serverPort}/images/${suiteSlug}/${type}/${fileName}`,
        path: filePath,
        siblingPaths,
        endpoint,
        baseUrl: suiteConfig?.baseUrl,
        fullUrl,
    };

    imageCache.set(hash, image);

    res.send(image);
});


export default router;

