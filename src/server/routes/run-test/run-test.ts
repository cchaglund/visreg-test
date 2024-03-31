import { getDiffsForWeb, /* startWebTest */ } from '../../../visreg';
import { ProgramChoices } from '../../../types';

const express = require('express');
const router = express.Router();

router.get('/:testType/:suiteSlug', async (req: any, res: any) => {
    const { suiteSlug, testType } = req.params;

	// const programChoices: ProgramChoices = {
	// 	suite: suiteSlug,
	// 	testType: testType, // full-test, diffs-only, assess-existing-diffs, targetted
	// };

	if (testType === 'assess-existing-diffs') {
		// startWebTest(programChoices);
		const diffs = getDiffsForWeb(suiteSlug);
		console.log('diffs', diffs);
		
		res.send({ 
			suiteSlug: suiteSlug,
			diffFiles: diffs
		});
	}

});

export default router;
