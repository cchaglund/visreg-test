import { useContext, useEffect, useRef } from 'react';
import x from '@stylexjs/stylex';
import { TestTypeSlug, TestContext } from '../../../../contexts/test-context';
import { terminalStyles } from '../../../../styles/terminal-style';

export type WebSocketData = {
    type: 'command' | 'data' | 'error' | 'text' | 'queue-progress' | 'queue-complete';
    name: 'start-test' | 'start-queue' | 'summary' | 'terminate';
    payload: string | object;
};


export type WebSocketCommand = WebSocketData & {
    type: 'command';
    name: 'start-test' | 'start-queue' | 'terminate';
};

type WebSocketStartTest = WebSocketCommand & {
    name: 'start-test';
    payload: {
        suiteSlug: string;
        testType: TestTypeSlug;
        targetEndpointTitles?: string[];
        targetViewports?: (string | number[])[];
    };
};

type WebSocketStartQueue = WebSocketCommand & {
    name: 'start-queue';
    payload: {
        suites: string[];
        testType: TestTypeSlug;
        targetEndpointTitles?: string[];
        targetViewports?: (string | number[])[];
    };
};

const Terminal = () => {
    const { 
        suiteConfig,
        onFinished,
        testStatus,
        runningTest,
        terminalRef,
        selectedTargetEndpoints,
        selectedTargetViewports,
        terminalOutput,
        updateTerminalOutput,
        isQueueMode,
        queueSuites,
    } = useContext(TestContext);

    
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end'});
        terminalRef.current?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ terminalOutput ]);


    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        if (testStatus === 'running') {
            if (isQueueMode && queueSuites.length > 0) {
                // Queue mode: send start-queue command with all suite names
                const data: WebSocketStartQueue = {
                    type: 'command',
                    name: 'start-queue',
                    payload: {
                        suites: queueSuites.map(s => s.suite),
                        testType: runningTest!,
                        targetEndpointTitles: selectedTargetEndpoints,
                        targetViewports: selectedTargetViewports,
                    },
                };

                ws.onopen = () => {
                    ws.send(JSON.stringify(data));
                };
            } else {
                // Single suite mode
                const data: WebSocketStartTest = {
                    type: 'command',
                    name: 'start-test',
                    payload: {
                        suiteSlug: suiteConfig.suiteSlug,
                        testType: runningTest!,
                        targetEndpointTitles: selectedTargetEndpoints,
                        targetViewports: selectedTargetViewports,
                    },
                };
                
                ws.onopen = () => {
                    ws.send(JSON.stringify(data));
                };
            }
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'data') {
                if (data.payload.name === 'visreg-summary') {
                    if (!isQueueMode) {
                        ws.close();
                    }
                    onFinished(data.payload);
                    return;
                }
                return;
            }

            if (data.type === 'queue-progress') {
                const { suite, index, total, status } = data.payload;
                updateTerminalOutput(
                    `\n--- Suite ${index + 1}/${total}: ${suite} [${status}] ---\n`,
                    '#4FC3F7'
                );
                return;
            }

            if (data.type === 'queue-complete') {
                const { suiteResults, allDiffs } = data.payload;
                updateTerminalOutput(
                    `\n--- Queue complete: ${suiteResults.length} suite(s), ${allDiffs.length} total diff(s) ---\n`,
                    '#81C784'
                );
                ws.close();
                return;
            }

            if (data.type === 'error') {
                console.error(data.payload);
                return;
            }

            if (data.type === 'text') {
                updateTerminalOutput(data.stdout, data.color);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testStatus]);


    return (
        <div {...x.props(terminalStyles.terminal)}>
            {terminalOutput.map((item, i) => <pre {...x.props(terminalStyles.log)} key={i}>{item}</pre>)}
            <div ref={endRef} />
        </div>
    );
};

export default Terminal;
