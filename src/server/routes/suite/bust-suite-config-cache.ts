import { bustSuiteConfigCache } from '../../services/fetch-suite-config';
const express = require('express');
const router = express.Router();

router.post('/bust-suite-config-cache', async (req: any, res: any) => {
    const { suiteSlug } = req.body;	
	const success = await bustSuiteConfigCache(suiteSlug);    
	res.send(success);
});

export default router;
