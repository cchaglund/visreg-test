import { getImage } from '../../services/get-image';

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const imageCache = new Map<string, any>();

router.get('/image/:suiteSlug/:fileName', async (req: any, res: any) => {
    const { suiteSlug, fileName } = req.params;

    // TODO: hm, won't this mean that even if e.g. the baseline image is updated, the cache will still return the old image?
    const hash = crypto.createHash('md5').update(suiteSlug + fileName).digest('hex');
    if (imageCache.has(hash)) {
        res.send(imageCache.get(hash));
        return;
    }

    const image = await getImage(suiteSlug, fileName, req.local.suitesDirectory);

    imageCache.set(hash, image);

    res.send(image);
});

export default router;

