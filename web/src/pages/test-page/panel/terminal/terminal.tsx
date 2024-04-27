import { useContext, useEffect, useRef } from 'react';
import x from '@stylexjs/stylex';
import { TestTypeSlug, TestContext } from '../../../../contexts/test-context';

export type WebSocketData = {
    type: 'command' | 'data' | 'error' | 'text';
    name: 'start-test' | 'summary' | 'terminate';
    payload: string | object;
};


export type WebSocketCommand = WebSocketData & {
    type: 'command';
    name: 'start-test' | 'terminate';
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

const s = x.create({
    terminal: {
        backgroundColor: '#0B2027',
        color: '#FCF7F8',
        height: '700px',
        overflowY: 'scroll',
        overflowX: 'scroll',
        fontFamily: 'monospace',
        width: '100%',
        maxWidth: '-webkit-fill-available',
        margin: '0 auto',
        marginBottom: '2rem',
        '@media (max-width: 900px)': {
            fontSize: '0.7rem',
        },
        '@media (max-width: 600px)': {
            fontSize: '0.5rem',
        },
    },
    log: {
        margin: 0,
    },
});

export type EndpointTestResult = {
    testTitle: string;
    errorMessage?: string;
    endpointTitle: string;
    viewport: string;
};

export type SummaryObject = {
    tests?: number;
    passing?: number;
    failing?: number;
    pending?: number;
    skipped?: number;
    duration?: number;
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

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'data') {
                if (data.payload.name === 'visreg-summary') {
                    console.log('visreg-summary', data.payload);
                    
                    ws.close();
                    onFinished(data.payload);
                    return;
                }
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
        <div {...x.props(s.terminal)}>
            {terminalOutput.map((item, i) => <pre {...x.props(s.log)} key={i}>{item}</pre>)}
            <div ref={endRef} />
        </div>
    );
};

export default Terminal;
