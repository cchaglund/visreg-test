import { useContext, useEffect, useRef, useState } from 'react';
import { TestContext } from '../../contexts/test-context';
import x from '@stylexjs/stylex';

const s = x.create({
    terminal: {
        backgroundColor: '#0B2027',
        color: '#FCF7F8',
        height: '700px',
        overflowY: 'scroll',
        fontFamily: 'monospace',
        width: '100%',
        maxWidth: '-webkit-fill-available',
        margin: '0 auto',
        marginBottom: '2rem',
    },
    log: {
        margin: 0,
    },
});

export type EndpointTestResult = {
    testTitle: string;
    errorMessage?: string;
    endpointName: string;
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
        applySummary,
        testStatus,
        runningTest,
        addToPassingEndpoints,
        addToFailingEndpoints,
        terminalRef,
    } = useContext(TestContext);
    const [ output, setOutput ] = useState<string[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end'});
        terminalRef.current?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ output ]);


    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        if (testStatus === 'running') {
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    type: 'start-test',
                    payload: {
                        suiteSlug: suiteConfig.suiteSlug,
                        testType: runningTest,
                    },
                }));
            };
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'data') {
                if (data.payload.name === 'summary') {
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
                const errorMessage = new RegExp(`(\\d+\\)\\s*${suiteConfig.suiteSlug})`, 'g'); // e.g. 1) suiteSlug

                if (data.payload.includes('Spec Ran')) {
                    const summary = parseSummary(data.payload);
                    applySummary(summary);
                    return;
                } 
                
                if (data.payload.includes('✓')) {
                    addPassingEndpoints(data.payload);
                    setOutput((prevOutput) => [ ...prevOutput, data.payload ]);
                    return;
                }
                
                if (data.payload.match(errorMessage)) {
                    addFailingEndpoints(data.payload, errorMessage);
                    setOutput((prevOutput) => [ ...prevOutput, data.payload ]);
                    return;
                }

                setOutput((prevOutput) => [ ...prevOutput, data.payload ]);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testStatus]);

    const addPassingEndpoints = (payload: string) => {
        // E.g. "✓ Start @ samsung-s10 (6090ms)"

        const testTitle = payload.replace(/✓| \(\d+ms\)/g, '').trim();
        const [ endpointName, viewport ] = testTitle.split(' @ ');

        addToPassingEndpoints({
            testTitle: testTitle,
            endpointName,
            viewport: viewport,
        });
    }

    const addFailingEndpoints = (payload: string, errorMessage: RegExp) => {
        const errorMessages: string[] = payload.split(errorMessage);        

        for (const [index, message] of errorMessages.entries()) {   

            if (index === 0 || index % 2 !== 0) continue;
            
            const splitIndex = message.indexOf(':');

            const roughTestTitle = message.substring(0, splitIndex).trim();
            const testTitle = roughTestTitle.substring(roughTestTitle.lastIndexOf('\n')).trim();
            const atSymbolIndex = testTitle.indexOf('@');
            const endpointName = testTitle.substring(0, atSymbolIndex).trim();
            const viewport = testTitle.substring(atSymbolIndex).trim();

            const errorMessage = message.substring(splitIndex + 1).trim();

            addToFailingEndpoints({
                testTitle: testTitle,
                errorMessage: errorMessage,
                endpointName,
                viewport: viewport,
            })
        }
    }

    const parseSummary = (data: string) => {
        const summaryObject: SummaryObject = {}

        data.split('\n').slice(1, -1).forEach((line: string) => {
            const text = line.match(/[a-zA-Z]+/)?.[0];
            const number = line.match(/\d+/)?.[0];

            if (text && number) {
                summaryObject[(text.toLowerCase() as keyof SummaryObject)] = parseInt(number);
            }
        });

        return summaryObject
    };

    return (
        <div {...x.props(s.terminal)}>
            {output.map((item, i) => <pre {...x.props(s.log)} key={i}>{item}</pre>)}
            <div ref={endRef} />
        </div>
    );
};

export default Terminal;
