import approve from './assessment/approve';
import reject from './assessment/reject';
import assessmentData from './assessment/assessment-data';
import summary from './assessment/summary';
import files from './files/files';
import file from './files/file';
import projectInformation from './general/project-information';
import getSuiteConfig from './suite/get-suite-config';
import deliverSuiteConfig from './suite/deliver-suite-config';

const express = require('express');
const router = express.Router();

// Assessment
router.use('/assessment', approve);
router.use('/assessment', reject);
router.use('/assessment', assessmentData);
router.use('/assessment', summary);


// Files
router.use('/files', files);
router.use('/files', file);

// General
router.use('/', projectInformation);

// Suite
router.use('/suite', getSuiteConfig);
router.use('/suite', deliverSuiteConfig);


export default router;
