import React, { createContext, useMemo, useState } from 'react';
import { api } from '../shared';
import { TestConfig } from '../types';

type AppContextType = {
    api: string;
    suiteName: string;
    suiteConfig?: TestConfig;
    setSuiteName: (name: string) => void;
    setSuiteConfig: (config: TestConfig) => void;
    currentDiffIndex: number | null;
    setCurrentDiffIndex: (index: number | null) => void;
    testHasBeenRunThisSession: boolean;
    setTestHasBeenRunThisSession: (value: boolean) => void;
};

const defaultValue: AppContextType = {
    api: '',
    suiteName: '',
    setSuiteName: () => {},
    setSuiteConfig: () => {},
    currentDiffIndex: 0,
    setCurrentDiffIndex: () => {},
    testHasBeenRunThisSession: false,
    setTestHasBeenRunThisSession: () => {},
};

export const AppContext = createContext(defaultValue);

export function AppContextWrapper(props: { children: React.ReactNode; }) {
    const [ suiteName, setSuiteNameState ] = useState('');
    const [ suiteConfig, setSuiteConfigState ] = useState<TestConfig>()
    const [ currentDiffIndex, setCurrentDiffIndexState ] = useState<number | null>(null);
    const [ testHasBeenRunThisSession, setTestHasBeenRunThisSession ] = useState(false);

    const appContext = useMemo(
        () => ({
            api,
            suiteName,
            suiteConfig,
            currentDiffIndex,
            testHasBeenRunThisSession,
            setSuiteName: (name: string) => {
                setSuiteNameState(name);
            },
            setSuiteConfig: (config: TestConfig) => {
                setSuiteConfigState(config);
            },
            setCurrentDiffIndex: (index: number | null) => {
                setCurrentDiffIndexState(index);
            },
            setTestHasBeenRunThisSession: (value: boolean) => {
                setTestHasBeenRunThisSession(value);
            },
        }),
        [suiteName, suiteConfig, currentDiffIndex, testHasBeenRunThisSession],
    );

    return (
        <AppContext.Provider value={appContext}>
            {props.children}
        </AppContext.Provider>
    );
}
