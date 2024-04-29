import * as fs from 'fs';
import { marked } from 'marked';
import * as path from 'path';
const express = require('express');
const router = express.Router();

router.get('/docs', (req: any, res: any) => {
    const readmePath = path.join(req.local.rootDirectory, 'node_modules', 'visreg-test', 'README.md');

    const readme = fs.readFileSync(readmePath, 'utf8');    
    const readmeHTML = marked(readme);

    res.send(readmeHTML);
});


export default router;
