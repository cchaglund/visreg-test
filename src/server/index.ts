import * as cors from 'cors';
import { initialCwd } from '../cli';
import * as path from 'path';
import { ProgramChoices } from '../types';
import { DiffObject } from '../diff-assessment-web';
import routes from './routes';
import { devPort, serverPort } from './config';
import * as readline from 'readline';

const express = require('express');

const enableSpaceToOpen = async (url: string) => {
	console.log('\nPress SPACE to open');

    const rl = readline.createInterface({
        input: process.stdin,
    });

	let answer;

	while (true) {
        answer = await new Promise(resolve => {
			// Enable raw mode to get individual keypresses
			readline.emitKeypressEvents(process.stdin);
			if (process.stdin.isTTY) process.stdin.setRawMode(true);

			process.stdin.on('keypress', (str, key) => {
				if (key.name === 'space') {
					resolve('web');
				}

				if (key.ctrl && key.name === 'c') {
					process.exit();
				}
			});
		});
		
		if (answer === 'web') {
			break;
		}
	}

	if (process.stdin.isTTY) process.stdin.setRawMode(false);
	rl.close();

    if (answer === 'web') {
        import('open').then((module) => {
            module(url);
        });
        return;
    }    
}

const startServer = (programChoices: ProgramChoices, diffFiles?: DiffObject[]) => {

    const app = express();

    app.use((req: any, res: any, next: any) => {
        req.local = {};

        /**
            TODO: I should remove this and just pass the programChoices to the routes and have the diffFiles be fetched by them.
            Because I'm doing that now when the user starts a test from the web interface, meaning that I have two ways of doing it now.
         */
        req.local.programChoices = programChoices;
        req.local.diffFiles = diffFiles;

        req.local.suitesDirectory = path.join(
            programChoices?.containerized ? '/app' : initialCwd,
            '/suites'
        )

        next();
    });

    app.use(express.json());

    if (process.env.NODE_ENV === 'development') {
        // This is used when developing (when React is being served by its dev server as opposed to being built and served by the express server)
        app.use(cors({
            origin: 'http://localhost:' + devPort
        }));

        console.log('Development mode', process.env.NODE_ENV);
    } else {
        // Serve static files
        app.use(express.static(path.join(__dirname, 'app')));
    }

    app.use('/', routes);

    app.get('*', (req: any, res: any) => {
        res.sendFile(path.resolve(__dirname, 'app', 'index.html'));
    });

    app.use(function (err: any, req: any, res: any, next: any) {
        console.error(err);
        
        res.send({
            error: true,
            errorCode: err.errorCode,
            errorMessage: err.errorMessage,
        });
    });
    
    app.listen(serverPort, () => {
        const webInterfacePort = process.env.NODE_ENV === 'development' ? devPort : serverPort;

        const baseUrl = `http://localhost:${webInterfacePort}`;
        const url = diffFiles ? `${baseUrl}/assessment` : baseUrl;

        if (diffFiles) {
            console.log(`Assessment is running at ${url}`);
        } else {
            console.log(`Web interface is running at ${url}`);
        }

        // We can't open the browser from inside a container
        if (programChoices?.containerized) return;
        
        enableSpaceToOpen(url);
    });
    
}

export default startServer;

