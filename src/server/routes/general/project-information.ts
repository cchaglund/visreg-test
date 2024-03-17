import { getSuites } from '../../../utils';
const express = require('express');
const router = express.Router();

const suites = getSuites();

router.get('/project-information', (req: any, res: any) => {
    res.send({
        suites
    });
});


export default router;
