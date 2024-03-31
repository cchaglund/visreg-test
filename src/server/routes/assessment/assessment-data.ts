import { getDiffsForWeb } from '../../../visreg';
const express = require('express');
const router = express.Router();

router.post('/data/', (req: any, res: any) => {
    const suiteSlug = req.body.suiteSlug;

    if (!suiteSlug) {
        res.send({
            suiteSlug: req.programChoices.suite,
            diffFiles: req.diffFiles,
        })
    }

    const diffs = getDiffsForWeb(suiteSlug);
    console.log('diffs', diffs);
    
    res.send({ 
        suiteSlug: suiteSlug,
        diffFiles: diffs
    });

});

export default router;


