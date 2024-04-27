const express = require('express');
const router = express.Router();

router.post('/terminate-process', (req: any, res: any) => {
    console.log('Terminating process');
    res.send('Terminating process');
    process.exit();
});


export default router;
