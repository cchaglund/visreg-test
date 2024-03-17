import { getSuites } from '../../../utils';
const express = require('express');
const router = express.Router();

const suites = getSuites();

router.get('/data', (req: any, res: any) => {    
    res.send({
        programChoices: req.programChoices,
        diffFiles: req.diffFiles,
        suites,
    })
});

export default router;


