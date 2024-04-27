import * as fs from 'fs';
import { marked } from 'marked';
import * as path from 'path';
const express = require('express');
const router = express.Router();

router.get('/docs', (req: any, res: any) => {
    const projectRoot = process.cwd();

    const readme = fs.readFileSync(path.join(projectRoot, 'node_modules', 'visreg-test', 'README.md'), 'utf8');    
    const readmeHTML = marked(readme);

    res.send(readmeHTML);
});


export default router;
