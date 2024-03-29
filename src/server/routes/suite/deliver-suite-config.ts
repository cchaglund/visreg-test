import { TestConfig } from '../../../types';
import { setSuiteConfigCache } from '../../services/fetch-suite-config';
const express = require('express');
const router = express.Router();

router.post('/deliver-suite-config', (req: any, res: any) => {
    const { testConfig, suiteName } = req.body as { testConfig: TestConfig, suiteName: string };
	setSuiteConfigCache(testConfig);
    res.send('ok');
});

export default router;
