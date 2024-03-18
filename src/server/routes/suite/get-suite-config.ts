import { fetchSuiteConfig } from '../../services/fetch-suite-config';
const express = require('express');
const router = express.Router();

router.post('/get-suite-config', async (req: any, res: any) => {
    const { suiteName } = req.body;	
	const config = await fetchSuiteConfig(suiteName);
	res.send(config);
});

export default router;
