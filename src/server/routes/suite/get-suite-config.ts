import { fetchSuiteConfig } from '../../services/fetch-suite-config';
const express = require('express');
const router = express.Router();

router.post('/get-suite-config', async (req: any, res: any) => {
    const { suiteSlug } = req.body;	
	const config = await fetchSuiteConfig(suiteSlug);
	res.send(config);
});

export default router;
