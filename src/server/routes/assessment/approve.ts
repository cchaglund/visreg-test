import { approveOrRejectViaWeb } from '../../../diff-assessment-web';

const express = require('express');
const router = express.Router();

router.post('/approve', (req: any, res: any) => {
    const index = req.body.index;        
    approveOrRejectViaWeb('approve', index);

    res.send('approved');
});

export default router;
