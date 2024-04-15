import { startWebTest } from '../../../visreg';
import { ProgramChoices } from '../../../types';
import { WebSocketServer } from 'ws';

const express = require('express');
const router = express.Router();

const wss = new WebSocketServer({ port: 8080 });

let ws: WebSocket;

wss.on('connection', (websocket: WebSocket) => {	
	console.log('run-test: connected');
	
    ws = websocket;

	ws.onmessage = (message: any) => {
		const data = JSON.parse(message.data);
	
		if (data.type === 'start-test') {
			const testType = data.payload.testType;
			
			if (testType === 'full-test') {
				startWebTest(ws, {
					suite: data.payload.suiteSlug,
					testType: data.payload.testType,
				});
			}
		}
	};
	
});

router.get('/start-ws', async (req: any, res: any) => {
    // const { suiteSlug, testType } = req.params;

	// const programChoices: ProgramChoices = {
	// 	suite: suiteSlug,
	// 	testType: testType, // full-test, diffs-only, assess-existing-diffs, targetted
	// };

	console.log('started ws');
	


	res.send('ok');

});
// router.get('/:suiteSlug/:testType', async (req: any, res: any) => {
//     const { suiteSlug, testType } = req.params;

// 	const programChoices: ProgramChoices = {
// 		suite: suiteSlug,
// 		testType: testType, // full-test, diffs-only, assess-existing-diffs, targetted
// 	};

// 	console.log('programChoices', programChoices);

// 	ws.onmessage = (message: any) => {
// 		const data = JSON.parse(message.data);

// 		if (data.type === 'ready') {
// 			console.log('connection ready!');
			
// 			if (testType === 'full-test') {
// 				console.log('Running full test');
// 				startWebTest(programChoices, ws);
// 			}
// 		}
// 	};

// 	res.send('ok');

// });

export default router;
