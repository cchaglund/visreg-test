import * as path from 'path';
import { getImage } from '../../services/get-image';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { getFileNameWithoutExtension, getFileType } from '../../../utils';

const asyncPipeline = promisify(pipeline);
const express = require('express');
const router = express.Router();

const MAX_CACHE_SIZE = 20;
const imageCache = new Map<string, any>();
const cacheKeys = new Array<string>();

const addToCache = (key: string, value: any) => {
    if (cacheKeys.length >= MAX_CACHE_SIZE) {
        const oldestKey = cacheKeys.shift();
        if (oldestKey) {
            imageCache.delete(oldestKey);
        }
    }

    imageCache.set(key, value);
    cacheKeys.push(key);
};

const computeHash = async (filePath: string): Promise<string> =>{
    const hash = createHash('md5');
    await asyncPipeline(createReadStream(filePath), hash);
    return hash.digest('hex');
}

router.get('/image/:suiteSlug/:fileName', async (req: any, res: any) => {
    const { suiteSlug, fileName } = req.params;

    const fileInfo = getFileInfo(req.local.suitesDirectory, suiteSlug, fileName);
    const filePath = fileInfo.filePath;

    const hash = await computeHash(filePath);

    if (imageCache.has(hash)) {        
        res.send(imageCache.get(hash));
        return;
    }

    const image = await getImage(fileInfo);
    addToCache(hash, image);
    res.send(image);
});

const getFileInfo = (suitesDirectory: string, suiteSlug: string, fileName: string) => {
    const suiteImagesDir = path.join(suitesDirectory, suiteSlug, 'snapshots/snaps');

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

    return {
        fileName,
        filePath,
        cleanName,
        suiteImagesDir,
        type,
        suiteSlug,
    };

}

export default router;

