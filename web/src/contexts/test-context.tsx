import React, { useState, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import { SummaryObject, EndpointTestResult } from '../components/terminal/terminal';
import { SummaryPayload } from '../pages/test-page/test-page';
import { TestConfig } from '../types';
import { api } from '../shared';

export type TestPageData = {
    suiteConfig: TestConfig;
};

type TestContextType = {
    testStatus: string;
    selectedName: string;
    startTest: (testType: string) => Promise<void>;
    suiteConfig: TestConfig;
    changeName: (name: string) => void;
    changeViewport: (viewport: string | number[]) => void;
    selectedViewport: string;
    resultsRef: React.RefObject<HTMLDivElement>;
    terminalRef: React.RefObject<HTMLDivElement>;
    summary: SummaryPayload | undefined;
    runningTest: string;
    terminalViewOpen: boolean;
    summaryState: SummaryObject | undefined;
    passingEndpoints: EndpointTestResult[];
    failingEndpoints: EndpointTestResult[];
    setTestStatus: (status: string) => void;
    setSelectedName: (name: string) => void;
    setRunningTest: (test: string) => void;
    toggleTerminalOpen: () => void;
    setSelectedViewport: (viewport: string) => void;
    applySummary: (summary: SummaryObject | undefined) => void;
    setPassingEndpoints: (endpoints: EndpointTestResult[]) => void;
    setFailingEndpoints: (endpoints: EndpointTestResult[]) => void;
    onFinished: (summary: SummaryPayload) => void;
    addToPassingEndpoints: (endpoint: EndpointTestResult) => void;
    addToFailingEndpoints: (failedEndpoint: EndpointTestResult) => void;
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
    testStatus: 'idle',
    selectedName: '',
    selectedViewport: '',
    startTest: async () => {},
    changeName: () => {},
    changeViewport: () => {},
    resultsRef: { current: null },
    terminalRef: { current: null },
    summary: undefined,
    runningTest: '',
    terminalViewOpen: false,
    summaryState: undefined,
    passingEndpoints: [],
    failingEndpoints: [],
    setTestStatus: () => {},
    setSelectedName: () => {},
    setRunningTest: () => {},
    toggleTerminalOpen: () => {},
    setSelectedViewport: () => {},
    applySummary: () => {},
    setPassingEndpoints: () => {},
    setFailingEndpoints: () => {},
    onFinished: () => {},
    addToPassingEndpoints: () => {},
    addToFailingEndpoints: () => {},
};

export const TestContext = React.createContext(defaultValue);

export function TestContextWrapper(props: { children: React.ReactNode; }) {
    const resultsRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const { suiteConfig } = useLoaderData() as TestPageData;
    const [ testStatus, setTestStatus ] = useState('idle');
    const [ selectedName, setSelectedName ] = useState<string>('');
    const [ summary, setSummary ] = useState<SummaryPayload>();
    const [ runningTest, setRunningTest ] = useState<string>('');
    const [ terminalViewOpen, setTerminalViewOpen ] = useState<boolean>(false);
    const [ selectedViewport, setSelectedViewport ] = useState<string>('');
    const [ summaryState, setSummaryState ] = useState<SummaryObject>();
    const [ passingEndpoints, setPassingEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ failingEndpoints, setFailingEndpoints ] = useState<EndpointTestResult[]>([]);

    const startTest = async (testType: string) => {
        setPassingEndpoints([]);
        setFailingEndpoints([]);
        setSummary(undefined);        
        setTerminalViewOpen(true);

        await new Promise(res => {
            setTimeout(() => res(1), 400);   
        });

        terminalRef.current?.scrollIntoView({ behavior: 'smooth' });

        await new Promise(res => {
            setTimeout(() => res(1), 400);
        });

        const res = await fetch(`${api}/test/start-ws`, {
            method: 'GET',
        });

        if (res.ok) {
            setRunningTest(testType);
            setTestStatus('running');
        }
    };

    const applySummary = (summary?: SummaryObject) => {
        setSummaryState(summary);
    }

    const toggleTerminalOpen = () => {        
        setTerminalViewOpen(prev => !prev);
    }

    const changeName = (name: string) => {
        setSelectedName(prev => prev === name ? '' : name);
    };

    const changeViewport = (viewport: string | number[]) => {
        const viewportString = Array.isArray(viewport) ? viewport.join(',') : viewport;
        setSelectedViewport(prev => prev === viewportString ? '' : viewportString);
    };

    const onFinished = (summary: SummaryPayload) => {
        setSummary(summary);
        setTestStatus('done');

        setTerminalViewOpen(false);
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };


    const addToPassingEndpoints = (endpoint: EndpointTestResult) => {
        setPassingEndpoints(prev => [ ...prev, endpoint ]);
    };

    const addToFailingEndpoints = (failedEndpoint: EndpointTestResult) => {
        setFailingEndpoints(prev => [ ...prev, failedEndpoint ]);
    };


    const testContext = React.useMemo(
        () => ({
            suiteConfig,
            testStatus,
            selectedName,
            startTest,
            changeName,
            changeViewport,
            selectedViewport,
            resultsRef,
            terminalRef,
            summary,
            runningTest,
            terminalViewOpen,
            summaryState,
            passingEndpoints,
            failingEndpoints,
            setTestStatus,
            setSelectedName,
            setRunningTest,
            toggleTerminalOpen,
            setSelectedViewport,
            applySummary,
            setPassingEndpoints,
            setFailingEndpoints,
            onFinished,
            addToPassingEndpoints,
            addToFailingEndpoints,

        }),
        [failingEndpoints, passingEndpoints, runningTest, selectedName, selectedViewport, suiteConfig, summary, summaryState, terminalViewOpen, testStatus],
    );

    return (
        <TestContext.Provider value={testContext}>
            {props.children}
        </TestContext.Provider>
    );
}