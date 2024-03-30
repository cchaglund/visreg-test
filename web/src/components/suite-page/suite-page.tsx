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
    imagesList?: ImagesList;
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
    formatUrl?: string;
    onPageVisit?: string;
    files: string[];
    fileEndpoint: string;
    directory: string;
};

type ImagesList = {
    baselineList: string[];
    diffList: string[];
    receivedList: string[];
};

export type ImagesListType = keyof ImagesList;

export type SuitePageData = {
    suiteSlug: string;
    imagesList: ImagesList,
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
    const { suiteSlug, imagesList, suiteConfig } = useLoaderData() as SuitePageData;
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
                    imagesList,
                }}>
                    <Outlet />
                </SuiteContext.Provider>

                <div></div>
            </div>
        </div>
    );
};

export default SuitePage;
