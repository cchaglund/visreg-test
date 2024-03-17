import React from 'react';
import { TestConfig } from '../components/suite-page/suite-page';
import { serverBaseUrl } from '../shared';

type AppContextType = {
    serverBaseUrl: string;
    suiteName: string;
    suiteConfig?: TestConfig;
    setSuiteName: (name: string) => void;
    setSuiteConfig: (config: TestConfig) => void;
    currentDiffIndex: number | null;
    setCurrentDiffIndex: (index: number | null) => void;
};

const defaultValue: AppContextType = {
    serverBaseUrl: '',
    suiteName: '',
    setSuiteName: () => {},
    setSuiteConfig: () => {},
    currentDiffIndex: 0,
    setCurrentDiffIndex: () => {},
};

export const AppContext = React.createContext(defaultValue);

export function AppContextWrapper(props: { children: React.ReactNode; }) {
    const [ suiteName, setSuiteNameState ] = React.useState('');
    const [ suiteConfig, setSuiteConfigState ] = React.useState<TestConfig>()
    const [ currentDiffIndex, setCurrentDiffIndexState ] = React.useState<number | null>(null);

    const appContext = React.useMemo(
        () => ({
            serverBaseUrl,
            suiteName,
            suiteConfig,
            currentDiffIndex,
            setSuiteName: (name: string) => {
                setSuiteNameState(name);
            },
            setSuiteConfig: (config: TestConfig) => {
                setSuiteConfigState(config);
            },
            setCurrentDiffIndex: (index: number | null) => {
                setCurrentDiffIndexState(index);
            }
        }),
        [suiteName, suiteConfig, currentDiffIndex],
    );

    return (
        <AppContext.Provider value={appContext}>
            {props.children}
        </AppContext.Provider>
    );
}
