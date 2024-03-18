import { approveOrRejectViaWeb } from '../../../diff-assessment-web';

const express = require('express');
const router = express.Router();

router.post('/reject', (req: any, res: any) => {
    const index = req.body.index;        
    approveOrRejectViaWeb('reject', index);

    res.send('rejected');
});

export default router;
