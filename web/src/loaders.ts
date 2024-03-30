import { AssessmentData } from './components/assessment-page/types';
import { TestConfig } from './components/suite-page/suite-page';
import { serverBaseUrl } from './shared';

export type GetImagesListParams = {
    suiteSlug: string;
    typeOfImage: 'diff' | 'baseline' | 'received';
};

export type GetSuiteImagesListParams = {
    suiteSlug: string;
};

export const getAssessmentData = async (): Promise<AssessmentData> => {
    const response = await fetch(serverBaseUrl + '/assessment/data');
    const data = await response.json();
    return data;
};

export const getSummary = async () => {
    const response = await fetch(serverBaseUrl + '/assessment/summary');
    const summary = await response.json();
    return summary;
};

export const getProjectInformation = async () => {
    const response = await fetch(serverBaseUrl + '/project-information');
    const projectInformation = await response.json();
    return projectInformation;
};

export const getSuiteConfig = async (suiteSlug?: string): Promise<TestConfig> => {
    const response = await fetch(serverBaseUrl + '/suite/get-suite-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suiteName: suiteSlug }),
    });

    const suiteConfig = await response.json();
    return suiteConfig;
};


export const getSuiteImagesList = async (args: GetSuiteImagesListParams) => {
    const { suiteSlug } = args;
    const diffList = await getImagesList({ suiteSlug, typeOfImage: 'diff' });
    const baselineList = await getImagesList({ suiteSlug, typeOfImage: 'baseline' });
    const receivedList = await getImagesList({ suiteSlug, typeOfImage: 'received' });

    return {
        diffList,
        baselineList,
        receivedList
    };
};

export const getImagesList = async (args: GetImagesListParams) => {
    const { suiteSlug, typeOfImage } = args;

    const url = `${serverBaseUrl}/images/list/${suiteSlug}/${typeOfImage}-list`;
    const response = await fetch(url);
    const images = await response.json();

    return images;
};

export type GetFileDetailsParams = {
    suiteSlug: string;
    fileName: string;
};

export const getImageDetails = async (args: GetFileDetailsParams) => {
    const { suiteSlug, fileName } = args;
    const url = `${serverBaseUrl}/images/image/${suiteSlug}/${fileName}`;
    const response = await fetch(url);
    const image = await response.json();

    return image;
};
