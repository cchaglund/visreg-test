import { runVisreg } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const viewports = [ 
    'samsung-s10', 
    [1280, 720]
];

const endpoints = [
    {
        title: 'Start',
        path: '/',
        onEndpointVisit: (cy, cypress) => {
            // Called between page load and snapshot, for this endpoint only
        },
    },
];

const formatUrl = (path) => {
    // Return a formatted url to visit
    return '';
};

const onPageVisit = (cy, cypress) => {
    // Called between page load and snapshot
};

runVisreg({
    baseUrl,
    endpoints,
    viewports,
    formatUrl,
    onPageVisit,
});