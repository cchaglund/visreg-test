import * as path from 'path';
import * as cors from 'cors';
import { ProgramChoices } from 'src/types';
const express = require('express');

const startServer = (programChoices: ProgramChoices) => {
    let pathToDiffDir = path.join(
        programChoices.containerized ? '/app' : process.cwd(),
        '/suites/test-suite/snapshots/snaps/__diff_output__'
    )

    if (programChoices.containerized) {
        pathToDiffDir = '/app' + pathToDiffDir;
    }

    
    const app = express();

    // This is used when developing (when Preact is being served by its dev server as opposed to being built and served by the express server)
    app.use(cors({
        origin: 'http://localhost:5173' // Preact dev server port
    }));

    // Serve static files from the "images" directory
    app.use('/images', express.static(pathToDiffDir));


    app.get('/', (req: any, res: any) => {
        const filename = 'Start @ 1280,720.diff.png';
        const filePath = '/images/' + filename;
        // const filePath = pathToDiffDir + '/' + filename;

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    #toolbar {
                        position: fixed;
                        bottom: 0;
                        width: 100%;
                        background-color: #f8f9fa;
                        padding: 10px 0;
                        text-align: center;
                    }
                    #toolbar button {
                        margin: 0 10px;
                    }
                </style>
                <script>
                    function handleClick(action) {
                        fetch('/' + action)
                            .then(response => response.text())
                            .then(data => console.log(data));
                    }
                </script>
            </head>
            <body>
                <img src="${filePath}" alt="Image">
                <div id="toolbar">
                    <button onclick="handleClick('approve')">Approve</button>
                    <button onclick="handleClick('reject')">Reject</button>
                </div>
            </body>
            </html>
        `);
    });

    app.get('/approve', (req: any, res: any) => {
        console.log('Approve test');
        res.send('Approve test');
    });

    app.get('/reject', (req: any, res: any) => {
        console.log('Reject test');
        res.send('Reject test');
    });

    app.get('/preact-test', (req: any, res: any) => {
        console.log('Preact!!1');
        res.send('Preact!!2');
    });

    app.listen(3000, () => {
        // execSync('ls -la', { stdio: 'inherit' });
        console.log('Web interface is running at http://localhost:3000');
    });
}

export default startServer;

