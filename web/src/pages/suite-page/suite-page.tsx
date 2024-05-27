import { Outlet, useLoaderData } from 'react-router-dom';
import { createContext, useEffect, useState } from 'react';
import stylex from '@stylexjs/stylex';
import FilterSidebar from './filter-sidebar';
import { TestConfig } from '../../types';

export type SuiteContextType = {
    selectedEndpoints: string[];
    selectedViewports: string[];
    suiteConfig?: TestConfig;
    parsedViewports?: string[];
};

const defaultValue: SuiteContextType = {
    selectedEndpoints: [],
    selectedViewports: [],
};

export const SuiteContext = createContext(defaultValue);

export type ImagesList = {
    baselineList: string[];
    diffList: string[];
    receivedList: string[];
};

export type SiblingPath = {
    type: 'baseline' | 'received' | 'diff';
    previewUrl: string;
};

export type ImagesListType = keyof ImagesList;

export type SuitePageData = {
    suiteSlug: string;
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
    const { suiteSlug, suiteConfig } = useLoaderData() as SuitePageData;
    const [ parsedViewports, setParsedViewports ] = useState<string[]>([]);
    const endpointsState = useState<string[]>([]);
    const viewportsState = useState<string[]>([]);

    const [ selectedEndpoints ] = endpointsState;
    const [ selectedViewports ] = viewportsState;

    useEffect(() => {
        if (suiteConfig?.viewports) {
            const parsedViewports = suiteConfig.viewports.map(viewport => {
                if (Array.isArray(viewport)) return viewport.join(',');
                return viewport;
            });

            setParsedViewports(parsedViewports);
        }
    }, [ suiteConfig, suiteSlug ]);


    return (
        <div {...stylex.props(s.suitePage)}>
            <div {...stylex.props(s.suitePageContent)}>

                <FilterSidebar
                    endpointsState={endpointsState}
                    viewportsState={viewportsState}
                    parsedViewports={parsedViewports}
                />

                <SuiteContext.Provider value={{
                    selectedEndpoints,
                    selectedViewports,
                    suiteConfig,
                    parsedViewports,
                }}>
                    <Outlet />
                </SuiteContext.Provider>

                <div></div>
            </div>
        </div>
    );
};

export default SuitePage;
