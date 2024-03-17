import { Outlet, useLoaderData } from 'react-router-dom';
import { AppContext } from '../../contexts/app-context';
import { createContext, useContext, useEffect, useState } from 'react';
import stylex from '@stylexjs/stylex';
import Sidebar from './sidebar';

export type SuiteContextType = {
    selectedName: string;
    selectedViewport: string;
    suiteConfig?: TestConfig;
    parsedViewports?: string[];
    filesList?: FilesLists;
};

const defaultValue: SuiteContextType = {
    selectedName: '',
    selectedViewport: '',
};

export const SuiteContext = createContext(defaultValue);

export type Endpoint = {
    title: string;
    path: string;
    blackout?: string[];
    elementToMatch?: string;
};

export type TestConfig = {
    suiteName?: string;
    baseUrl: string;
    endpoints: Endpoint[];
    viewports?: string[] | number[][];
};

type FilesLists = {
    baselineList: string[];
    diffList: string[];
    receivedList: string[];
};

export type FilesListsType = keyof FilesLists;



export type SuitePageData = {
    suiteSlug: string;
    filesList: FilesLists,
    suiteConfig: TestConfig;
};

const s = stylex.create({
    suitePage: {
        height: '100%',
        width: '-webkit-fill-available',
        paddingInline: '2rem',
        paddingBottom: '2rem',
        paddingTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
    },
    suitePageContent: {
        display: 'flex',
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
});

const SuitePage = () => {
    const { suiteSlug, filesList, suiteConfig } = useLoaderData() as SuitePageData;
    const { setSuiteName } = useContext(AppContext);
    const [ parsedViewports, setParsedViewports ] = useState<string[]>([]);
    const [ selectedName, setSelectedName ] = useState<string>('');
    const [ selectedViewport, setSelectedViewport ] = useState<string>('');


    useEffect(() => {
        setSuiteName(suiteSlug);

        if (suiteConfig?.viewports) {
            const parsedViewports = suiteConfig.viewports.map(viewport => {
                if (Array.isArray(viewport)) return viewport.join(',');
                return viewport;
            });

            setParsedViewports(parsedViewports);
        }
    }, [ setSuiteName, suiteConfig, suiteSlug ]);

    return (
        <div {...stylex.props(s.suitePage)}>
            <div {...stylex.props(s.suitePageContent)}>

                <Sidebar
                    setSelectedName={setSelectedName}
                    setSelectedViewport={setSelectedViewport}
                    selectedName={selectedName}
                    selectedViewport={selectedViewport}
                    parsedViewports={parsedViewports}
                />

                <SuiteContext.Provider value={{
                    selectedName,
                    selectedViewport,
                    suiteConfig,
                    parsedViewports,
                    filesList,
                }}>
                    <Outlet />
                </SuiteContext.Provider>

                <div></div>
            </div>
        </div>
    );
};

export default SuitePage;
