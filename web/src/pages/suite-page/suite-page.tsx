import { Outlet, useLoaderData } from 'react-router-dom';
import { createContext, useEffect, useState } from 'react';
import stylex from '@stylexjs/stylex';
import FilterSidebar from './filter-sidebar';
import { TestConfig } from '../../types';

export type SuiteContextType = {
    selectedEndpoint: string;
    selectedViewport: string;
    suiteConfig?: TestConfig;
    parsedViewports?: string[];
    imagesList?: ImagesList;
};

const defaultValue: SuiteContextType = {
    selectedEndpoint: '',
    selectedViewport: '',
};

export const SuiteContext = createContext(defaultValue);

type ImagesList = {
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
    const [ parsedViewports, setParsedViewports ] = useState<string[]>([]);
    const endpointState = useState<string>('');
    const viewportState = useState<string>('');

    const [ selectedEndpoint ] = endpointState;
    const [ selectedViewport ] = viewportState;

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
                    endpointState={endpointState}
                    viewportState={viewportState}
                    parsedViewports={parsedViewports}
                />

                <SuiteContext.Provider value={{
                    selectedEndpoint,
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
