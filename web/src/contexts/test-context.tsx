import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLoaderData } from 'react-router-dom';
import { TestConfig } from '../types';
import { api } from '../shared';
import { ImagesList } from '../pages/suite-page/suite-page';
import { WebSocketCommand } from '../pages/test-page/panel/terminal/terminal';
import { convertStringToElements } from '../helpers/convert-string-to-react-elements';
import { AppContext } from './app-context';

export type TestPageData = {
    suiteConfig: TestConfig;
    imagesList: ImagesList;
};

export type ProgramChoices = {
	suite?: string,
	targetEndpointTitles: string[] | [],
	targetViewports: (string | number[])[] | [],
	fullTest?: boolean | string,
	diffsOnly?: boolean | string,
	assessExistingDiffs?: boolean | string,
	targetted?: boolean | string,
	labMode?: boolean,
	testType: TestTypeSlug,
	gui?: boolean,
	snap?: boolean,
	scaffold?: boolean,
	scaffoldTs?: boolean,
	containerized?: boolean,
	serverStart?: boolean,
	webTesting?: boolean,
}


export type SummaryPayload = {
    userTerminatedTest: boolean;
    testDiffList: string[];
    allDiffList: string[];
    testType: TestTypeSlug;
    endpointTestResults: {
        passing: EndpointTestResult[];
        failing: EndpointTestResult[];
        skipped: EndpointTestResult[];
        unchanged: EndpointTestResult[];
    };
    programChoices: ProgramChoices;
    cypressSummary: SummaryObject;
    testAgenda: string[];
    createdAt: string;
    terminated: boolean;
};

export type OldTestResults = {
    createdAt: string;
    visregSummary: SummaryPayload;
    terminalOutput: (string | React.ReactElement)[];
    index: number;
};

export type ComponentStringified = { 
    type: string;
    props: {
        children: string;
        style: {
            color: string;
        };
    }
};

export type History = OldTestResults[];

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

export type TestTypeSlug = 'full-test' | 'diffs-only' | 'targetted';
export type TestStatusType = 'terminated' | 'terminating' | 'running' | 'idle' | 'done';

type TestContextType = {
    testStatus: TestStatusType;
    selectedTargetEndpoints: string[];
    startTest: (testType: TestTypeSlug) => Promise<void>;
    suiteConfig: TestConfig;
    images: ImagesList;
    addTargetEndpoint: (name: string) => void;
    addTargetViewport: (viewport: string | number[]) => void;
    selectedTargetViewports: (string | number[])[];
    resultsRef: React.RefObject<HTMLDivElement>;
    terminalRef: React.RefObject<HTMLDivElement>;
    visregSummary: SummaryPayload | undefined;
    runningTest?: TestTypeSlug;
    terminalViewOpen: boolean;
    passingEndpoints: EndpointTestResult[];
    failingEndpoints: EndpointTestResult[];
    skippedEndpoints: EndpointTestResult[];
    toggleTerminalOpen: () => void;
    onFinished: (visregSummary: SummaryPayload) => void;
    terminalOutput: (string | React.ReactElement)[];
    updateTerminalOutput: (output: string | React.ReactElement, color?: string) => void;
    initiateTerminationOfTest: () => void;
    history?: History;
};

const defaultValue: TestContextType = {
    suiteConfig: {
        suiteSlug: '',
        baseUrl: '',
        endpoints: [],
        files: [],
        fileEndpoint: '',
        directory: '',
    },
    images: {
        diffList: [],
        baselineList: [],
        receivedList: [],
    },
    testStatus: 'idle',
    selectedTargetEndpoints: [],
    selectedTargetViewports: [],
    startTest: async () => {},
    addTargetEndpoint: () => {},
    addTargetViewport: () => {},
    resultsRef: { current: null },
    terminalRef: { current: null },
    visregSummary: undefined,
    runningTest: undefined,
    terminalViewOpen: false,
    passingEndpoints: [],
    failingEndpoints: [],
    skippedEndpoints: [],
    toggleTerminalOpen: () => {},
    onFinished: () => {},
    terminalOutput: [],
    updateTerminalOutput: () => {},
    initiateTerminationOfTest: () => {},
    history: [],
};

export const TestContext = React.createContext(defaultValue);

const ws = new WebSocket('ws://localhost:8080');

export function TestContextWrapper(props: { children: React.ReactNode; }) {
    const { testHasBeenRunThisSession, setTestHasBeenRunThisSession } = useContext(AppContext);
    
    const { suiteConfig, imagesList } = useLoaderData() as TestPageData;

    const resultsRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    const [ testStatus, setTestStatus ] = useState<TestStatusType>('idle');
    const [ selectedTargetEndpoints, setSelectedTargetEndpoints ] = useState<string[]>([]);
    const [ runningTest, setRunningTest ] = useState<TestTypeSlug>();
    const [ terminalViewOpen, setTerminalViewOpen ] = useState<boolean>(false);
    const [ selectedTargetViewports, setSelectedViewport ] = useState<(string | number[])[]>([]);
    const [ passingEndpoints, setPassingEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ failingEndpoints, setFailingEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ skippedEndpoints, setSkippedEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ images, setImages ] = useState<ImagesList>(imagesList);
    const [ visregSummary, setVisregSummary ] = useState<SummaryPayload>();
    const [ terminalOutput, setTerminalOutput ] = useState<(string | React.ReactElement)[]>([]);
    const [ history, setHistory ] = useState<History>(() => {
        const history = localStorage.getItem('visreg-history');
        return history ? JSON.parse(history) : [];
    });

    useEffect(() => {
        // Only if a test has been run this session do we want to load the most recent one into the state.
        if (!testHasBeenRunThisSession) return;

        const history = localStorage.getItem('visreg-history');
        const parsedHistory = history ? JSON.parse(history) : [];
        setHistory(parsedHistory);

        const mostRecentTestOfSuite: undefined | OldTestResults = parsedHistory
            .find((test: OldTestResults) => test.visregSummary.programChoices.suite === suiteConfig.suiteSlug);

        if (!mostRecentTestOfSuite) {
            return;
        }

        setVisregSummary(mostRecentTestOfSuite.visregSummary);
        setTerminalOutput(convertStringToElements(mostRecentTestOfSuite.terminalOutput));

        return () => {
            ws.close();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startTest = async (testType: TestTypeSlug) => {
        setTerminalOutput([]);
        setPassingEndpoints([]);
        setFailingEndpoints([]);
        setVisregSummary(undefined);        
        setTerminalViewOpen(true);

        const res = await fetch(`${api}/test/start-ws`, { method: 'GET' });

        if (res.ok) {
            scrollDown();
            setRunningTest(testType);
            setTestStatus('running');
        }
    };

    const scrollDown = async () => {
        await new Promise(res => { setTimeout(() => res(1), 400); });        
        const pageHeight = document.documentElement.scrollHeight;
        window.scrollTo({ top: pageHeight, behavior: 'smooth' });
    }

    const updateTerminalOutput = (output: string | React.ReactElement, color?: string) => {
        let outputElement = output;

        if (color) {
            outputElement = <span style={{ color }}>{output}</span>;
        }
        
        setTerminalOutput(prev => {
            return [ ...prev, outputElement ]
        });
    }

    useEffect(() => {
        if (testStatus === 'terminated' || testStatus === 'done' && visregSummary) {
            updateHistory(visregSummary!);
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [terminalOutput, testStatus, visregSummary]);

    const toggleTerminalOpen = () => setTerminalViewOpen(prev => !prev);

    const addTargetEndpoint = (name: string) => {
        setSelectedTargetEndpoints(prev => {
            return prev.includes(name) 
                ? prev.filter(n => n !== name)
                : [ ...prev, name ]
        });
    };

    const addTargetViewport = (viewport: string | number[]) => {
        const viewportString = Array.isArray(viewport) ? viewport.join(',') : viewport;
        setSelectedViewport(prev => {
            return prev.includes(viewportString) 
                ? prev.filter(v => v !== viewportString)
                : [ ...prev, viewportString ]
        });
    };

    const initiateTerminationOfTest = () => {
        setTestStatus('terminating');
        updateTerminalOutput(
            <pre>
                <br />
                <pre style={{ color: '#faa916', textAlign: 'center'}}>
                    Stopping tests after current endpoint completes... (this may take a few seconds)
                </pre>
                <br />
            </pre>
        )
        
        const data: WebSocketCommand = {
            type: 'command',
            name: 'terminate',
            payload: '',
        };

        ws.send(JSON.stringify(data))
    }

    const updateHistory = (visregSummary: SummaryPayload) => {
        const history: History = JSON.parse(localStorage.getItem('visreg-history') || '[]');

        if (history.length >= 100) {
            history.shift(); // Remove the oldest item
        }

        history.push({
            createdAt: visregSummary.createdAt,
            visregSummary,
            terminalOutput,
            index: history.length,
        });

        localStorage.setItem('visreg-history', JSON.stringify(history));
        setHistory(history);
    };


    const onFinished = (visregSummary: SummaryPayload) => {
        setSelectedTargetEndpoints([]);
        setSelectedViewport([]);
        setTestHasBeenRunThisSession(true);

        setImages({
            ...images,
            diffList: visregSummary.allDiffList || [],
        });
        
        setPassingEndpoints(visregSummary.endpointTestResults.passing);
        setFailingEndpoints(visregSummary.endpointTestResults.failing);
        setSkippedEndpoints(visregSummary.endpointTestResults.skipped);

        const visregSummaryUpdated: SummaryPayload = { ...visregSummary, testType: runningTest! };

        setVisregSummary(visregSummaryUpdated);

        setTestStatus(prev => prev === 'terminating' ? 'terminated' : 'done');

        setTerminalViewOpen(false);
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    const testContext: TestContextType = React.useMemo(
        () => ({
            suiteConfig,
            images,
            testStatus,
            resultsRef,
            terminalRef,
            visregSummary,
            runningTest,
            terminalViewOpen,
            passingEndpoints,
            failingEndpoints,
            skippedEndpoints,
            startTest,
            toggleTerminalOpen,
            onFinished,
            addTargetEndpoint,
            addTargetViewport,
            selectedTargetViewports,
            selectedTargetEndpoints,
            terminalOutput,
            updateTerminalOutput,
            initiateTerminationOfTest,
            history,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [failingEndpoints, passingEndpoints, skippedEndpoints, runningTest, selectedTargetEndpoints, selectedTargetViewports, suiteConfig, visregSummary, /* cypressSummaryState, */ terminalViewOpen, testStatus, terminalOutput, imagesList, history],
    );

    return (
        <TestContext.Provider value={testContext}>
            {props.children}
        </TestContext.Provider>
    );
}