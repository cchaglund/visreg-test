import { ProgramChoices } from '../../../types';
import { startWebTest, startWebSuiteQueue } from '../../../visreg';
import { WebSocketServer } from 'ws';
// import { getServer } from 'src/server';

const express = require('express');
const router = express.Router();

const wss = new WebSocketServer({ port: 8080 });
// const wss = new WebSocketServer({ server: getServer() });

let ws: WebSocket;
let terminate = false;

wss.on('connection', (websocket: WebSocket) => {	
    ws = websocket;

	ws.onmessage = (message: any) => {
		const data = JSON.parse(message.data);		

		if (data.type === 'command' && data.name === 'terminate') {
			terminate = true;
		}

		if (data.type === 'command' && data.name === 'start-test') {
			terminate = false;
			const progChoices: Partial<ProgramChoices> = {
				suite: data.payload.suiteSlug,
				testType: data.payload.testType,
				targetEndpointTitles: data.payload.targetEndpointTitles,
				targetViewports: data.payload.targetViewports,
			};			

			startWebTest(ws, progChoices);
		}

		if (data.type === 'command' && data.name === 'start-queue') {
			terminate = false;
			const suites: string[] = data.payload.suites;
			const testType: string = data.payload.testType;
			const progChoices: Partial<ProgramChoices> = {
				testType: data.payload.testType,
				targetEndpointTitles: data.payload.targetEndpointTitles,
				targetViewports: data.payload.targetViewports,
			};

			startWebSuiteQueue(ws, suites, testType, progChoices);
		}
	};
});


router.get('/terminate-json', async (req: any, res: any) => {	
	res.send({ terminate });
})

router.get('/start-ws', async (req: any, res: any) => {
	res.send('ok');
});

export default router;
