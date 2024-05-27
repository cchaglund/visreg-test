import { serverPort } from './server/config';
import { RunTest, TestConfig } from './types';

export const runVisreg: RunTest = async (props: TestConfig) => {
    if (process.env.SEND_SUITE_CONF) {
        sendSuiteConf(props);
    } else {
        const { runTest } = await import('./cypress/e2e/visual-regression-tests.cy.js');
        runTest(props);
    }
};

const sendSuiteConf = (props: TestConfig) => {
    const api = `http://localhost:${serverPort}/api`;

    const stringifiedConfig = stringifyConfig(props);

    fetch(api + '/suite/deliver-suite-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testConfig: stringifiedConfig }),
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
};

const stringifyConfig = (props: TestConfig) => {
    const stringifiedEndpoints = props.endpoints.map(endpoint => {
        const { onBeforeVisit, onVisit, onAfterVisit, ...rest } = endpoint;

        return {
            ...rest,
            ...onBeforeVisit ? { onBeforeVisit: onBeforeVisit.toString() } : {},
            ...onVisit ? { onVisit: onVisit.toString() } : {},
            ...onAfterVisit ? { onAfterVisit: onAfterVisit.toString() } : {},
        };
    });

    const stringifiedConfig = {
        ...props,
        ...props.formatUrl ? { formatUrl: props.formatUrl.toString() } : {},
        ...props.onVisit ? { onVisit: props.onVisit.toString() } : {},
        endpoints: stringifiedEndpoints,
    };

    return stringifiedConfig;
};
