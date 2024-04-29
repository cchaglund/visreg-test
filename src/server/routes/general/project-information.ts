import { getVersion } from '../../../visreg';
import { getSuites } from '../../../utils';
const express = require('express');
const router = express.Router();

const suites = getSuites();

router.get('/project-information', (req: any, res: any) => {
    const version = getVersion();
    
    res.send({
        suites,
        version,
    });
});


export default router;
