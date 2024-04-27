import React, { useState, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import { TestConfig } from '../types';
import { api } from '../shared';
import { ImagesList } from '../pages/suite-page/suite-page';
import { SummaryObject, EndpointTestResult, WebSocketCommand } from '../pages/test-page/panel/terminal/terminal';

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
    cypressSummaryState: SummaryObject | undefined;
    passingEndpoints: EndpointTestResult[];
    failingEndpoints: EndpointTestResult[];
    skippedEndpoints: EndpointTestResult[];
    toggleTerminalOpen: () => void;
    onFinished: (visregSummary: SummaryPayload) => void;
    terminalOutput: (string | React.ReactNode)[];
    updateTerminalOutput: (output: string | React.ReactNode, color?: string) => void;
    initiateTerminationOfTest: () => void;
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
    cypressSummaryState: undefined,
    passingEndpoints: [],
    failingEndpoints: [],
    skippedEndpoints: [],
    toggleTerminalOpen: () => {},
    onFinished: () => {},
    terminalOutput: [],
    updateTerminalOutput: () => {},
    initiateTerminationOfTest: () => {},
};

export const TestContext = React.createContext(defaultValue);

const ws = new WebSocket('ws://localhost:8080');

export function TestContextWrapper(props: { children: React.ReactNode; }) {
    const resultsRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const { suiteConfig, imagesList } = useLoaderData() as TestPageData;
    const [ testStatus, setTestStatus ] = useState<TestStatusType>('idle');
    const [ selectedTargetEndpoints, setSelectedTargetEndpoints ] = useState<string[]>([]);
    const [ visregSummary, setVisregSummary ] = useState<SummaryPayload>();
    const [ runningTest, setRunningTest ] = useState<TestTypeSlug>();
    const [ terminalViewOpen, setTerminalViewOpen ] = useState<boolean>(false);
    const [ selectedTargetViewports, setSelectedViewport ] = useState<(string | number[])[]>([]);
    const [ cypressSummaryState, setCypressSummaryState ] = useState<SummaryObject>();
    const [ terminalOutput, setTerminalOutput ] = useState<(string | React.ReactNode)[]>([]);
    const [ passingEndpoints, setPassingEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ failingEndpoints, setFailingEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ skippedEndpoints, setSkippedEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ images, setImages ] = useState<ImagesList>(imagesList);


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

    const updateTerminalOutput = (output: string | React.ReactNode, color?: string) => {
        let outputElement = output;

        if (color) {
            outputElement = <span style={{ color }}>{output}</span>;
        }
        setTerminalOutput(prev => [ ...prev, outputElement ]);
    }

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

    const onFinished = (visregSummary: SummaryPayload) => {
        setSelectedTargetEndpoints([]);
        setSelectedViewport([]);
        setCypressSummaryState(visregSummary.cypressSummary);

        setImages({
            ...images,
            diffList: visregSummary.allDiffList || [],
        });
        
        setPassingEndpoints(visregSummary.endpointTestResults.passing);
        setFailingEndpoints(visregSummary.endpointTestResults.failing);
        setSkippedEndpoints(visregSummary.endpointTestResults.skipped);

        setVisregSummary({...visregSummary, testType: runningTest!});
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
            cypressSummaryState,
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
        }),
        [failingEndpoints, passingEndpoints, skippedEndpoints, runningTest, selectedTargetEndpoints, selectedTargetViewports, suiteConfig, visregSummary, cypressSummaryState, terminalViewOpen, testStatus, terminalOutput, imagesList],
    );

    return (
        <TestContext.Provider value={testContext}>
            {props.children}
        </TestContext.Provider>
    );
}