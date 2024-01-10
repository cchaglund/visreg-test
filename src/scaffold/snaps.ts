import { runVisreg, VisregViewport, Endpoint, TestConfig, OnVisitFunction } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const viewports: VisregViewport[] = [
    'samsung-s10', 
    [1280, 720]
];

const endpoints: Endpoint[] = [
    {
        title: 'Start',
        path: '/',
        onEndpointVisit: (cy, cypress) => {
            // Called between page load and snapshot, for this endpoint only
        },
    },
];

const formatUrl = (path: string) => {
    // Return a formatted url to visit
    return '';
};

const onPageVisit: OnVisitFunction = (cy, cypress) => {
    // Called between page load and snapshot
};

runVisreg({
    baseUrl,
    endpoints,
    viewports,
    formatUrl,
    onPageVisit,
} as TestConfig);