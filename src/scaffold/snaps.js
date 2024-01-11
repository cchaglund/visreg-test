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
    /**
     * Optional.
     * Return a formatted url to visit.
     * If this function isn't specified or if it returns a nullish value, the baseUrl + endpoint.path will be used.
     */
    return '';
};

const onPageVisit = (cy, cypress) => {
    // Called between page load and snapshot, for all endpoints
};

runVisreg({
    baseUrl,
    endpoints,
    viewports,
    formatUrl,
    onPageVisit,
});

