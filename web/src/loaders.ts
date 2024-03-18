import { AssessmentData } from './components/assessment-page/types';
import { TestConfig } from './components/suite-page/suite-page';
import { serverBaseUrl } from './shared';

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

export type GetSuiteFilesListParams = {
    suiteSlug: string;
}

export const getSuiteFilesList = async (args: GetSuiteFilesListParams) => {
    const { suiteSlug } = args;
    const diffList = await getFilesList({ suiteSlug, typeOfFiles: 'diff' });
    const baselineList = await getFilesList({ suiteSlug, typeOfFiles: 'baseline' });
    const receivedList = await getFilesList({ suiteSlug, typeOfFiles: 'received' });

    return {
        diffList,
        baselineList,
        receivedList
    }
}

export type GetFilesListParams = {
    suiteSlug: string;
    typeOfFiles: 'diff' | 'baseline' | 'received';
}

export const getFilesList = async (args: GetFilesListParams) => {
    const { suiteSlug, typeOfFiles } = args;

    const url = `${serverBaseUrl}/files/list/${suiteSlug}/${typeOfFiles}-list`;
    const response = await fetch(url);
    const files = await response.json();
    
    return files;
}

export type GetFileDetailsParams = {
    suiteSlug: string;
    fileName: string;
}

export const getFileDetails = async (args: GetFileDetailsParams) => {
    // return { error: 'Not implemented'}
    const { suiteSlug, fileName } = args;
    const url = `${serverBaseUrl}/files/file/${suiteSlug}/${fileName}`;
    const response = await fetch(url);
    const file = await response.json();

    // const snapshotName = fileName.slice(0, fileName.indexOf(' @')); // Without the viewport    

    // const suiteConfig = await getSuiteConfig(suiteSlug);
    // const endpoint = suiteConfig.endpoints.find(endpoint => endpoint.title === snapshotName);

    // if (endpoint) {
    //     file.endpoint = endpoint;
    // }
    
    return file;
}
