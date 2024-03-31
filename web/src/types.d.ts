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


export type Image = {
    name: string;
    fileName: string;
    createdAt: Date;
    modifiedAt: Date;
    type: string;
    suiteName: string;
    sizeString: string;
    url: string;
    siblingPaths: SiblingPath[];
    fileUrl: string;
    baseUrl?: string;
    endpoint?: Endpoint;
    fullUrl?: string;
    path: string;
};

