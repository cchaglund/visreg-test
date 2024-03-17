import { getSummary } from '../../../diff-assessment-web';

const express = require('express');
const router = express.Router();

router.get('/summary', (req: any, res: any) => {
    res.send(getSummary());
});


export default router;
