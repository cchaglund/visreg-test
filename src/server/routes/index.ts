import assessmentData from './assessment/assessment';
import images from './images/images';
import serveImages from './images/serve-images';
import image from './images/image';
import file from './files/file';
import projectInformation from './general/project-information';
import terminateProcess from './general/terminate-process';
import getSuiteConfig from './suite/get-suite-config';
import deliverSuiteConfig from './suite/deliver-suite-config';
import runTest from './run-test/run-test';
import bustSuiteConfigCache from './suite/bust-suite-config-cache';
import docs from './general/docs';

const express = require('express');
const router = express.Router();

// Assessment
router.use('/api/assessment', assessmentData);

// Images
router.use('/api/images', images);
router.use('/api/images', image);
router.use('/images', serveImages);

// Files
router.use('/api/files', file);

// General
router.use('/api/', projectInformation);
router.use('/api/', terminateProcess);
router.use('/api/', docs);

// Suite
router.use('/api/suite', getSuiteConfig);
router.use('/api/suite', deliverSuiteConfig);
router.use('/api/suite', bustSuiteConfigCache);

// Run tests
router.use('/api/test', runTest);

export default router;
