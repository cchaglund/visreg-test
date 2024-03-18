import { serverPort } from './server/config';
import { RunTest, TestConfig } from './types';

export const runVisreg: RunTest = async (props: TestConfig) => {    
    if (process.env.SEND_SUITE_CONF) {
        sendSuiteConf(props);
    } else {
        const { runTest } = await import('./cypress/e2e/visual-regression-tests.cy');
        runTest(props);
    }
};

const sendSuiteConf = (props: TestConfig) => {
    const baseUrl = 'http://localhost:' + serverPort;

    fetch(baseUrl + '/suite/deliver-suite-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testConfig: props, suiteName: process.env.SUITE_NAME }),
    })
    .then(response => {        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .catch(error => {
        console.error('There was an error with the fetch operation:', error);
    });
}

