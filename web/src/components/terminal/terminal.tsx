import { useEffect, useRef, useState } from 'react';
import x from '@stylexjs/stylex';
import { SummaryPayload } from '../../pages/test-page/test-page';

const s = x.create({
    terminal: {
        padding: '1rem',
        backgroundColor: '#0B2027',
        color: '#FCF7F8',
        height: '700px',
        overflowY: 'scroll',
        fontFamily: 'monospace',
        width: '100%',
        minWidth: '900px',
        margin: '0 auto',
        marginBottom: '2rem',
    },
});

export type EndpointTestResult = {
    testTitle: string;
    errorMessage?: string;
    endpointName: string;
    viewport: string;
};

type TerminalProps = {
    onFinished: (summary: SummaryPayload) => void;
    suiteSlug: string;
    testType: string;
    initiate: boolean;
    setSummary: (summary: SummaryObject) => void;
    addPassingEndpoint: (endpoint: EndpointTestResult) => void;
    addFailingEndpoint: (failedEndpoint: EndpointTestResult) => void;
};

export type SummaryObject = {
    tests?: number;
    passing?: number;
    failing?: number;
    pending?: number;
    skipped?: number;
    duration?: number;
};

const Terminal = (props: TerminalProps) => {
    const { onFinished, setSummary, suiteSlug, testType, initiate, addPassingEndpoint, addFailingEndpoint } = props;
    const [ output, setOutput ] = useState<string[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end'});
    }, [ output ]);


    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        if (initiate) {
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    type: 'start-test',
                    payload: {
                        suiteSlug: suiteSlug,
                        testType: testType,
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
                const errorMessage = new RegExp(`(\\d+\\)\\s*${suiteSlug})`, 'g'); // e.g. 1) suiteSlug

                if (data.payload.includes('Spec Ran')) {
                    const summary = parseSummary(data.payload);
                    setSummary(summary);
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
    }, [initiate]);

    const addPassingEndpoints = (payload: string) => {
        // E.g. "✓ Start @ samsung-s10 (6090ms)"

        const testTitle = payload.replace(/✓| \(\d+ms\)/g, '').trim();
        const [ endpointName, viewport ] = testTitle.split(' @ ');

        addPassingEndpoint({
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

            addFailingEndpoint({
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
            {output.map((item, i) => <pre key={i}>{item}</pre>)}
            <div ref={endRef} />
        </div>
    );
};

export default Terminal;