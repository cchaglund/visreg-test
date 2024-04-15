import { TestConfig } from '../../../types';
import { setSuiteConfigCache } from '../../services/fetch-suite-config';
const express = require('express');
const router = express.Router();

router.post('/deliver-suite-config', (req: any, res: any) => {
    const { testConfig } = req.body as { testConfig: TestConfig };
	setSuiteConfigCache(testConfig);
    res.send('ok');
});

export default router;
