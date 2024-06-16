import { runVisreg, VisregViewport, Endpoint, TestConfig, EndpointHookFunction } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const viewports: VisregViewport[] = [
    'samsung-s10', 
    [1280, 720]
];

const endpoints: Endpoint[] = [
    {
        title: 'Start',
        path: '/',
        onVisit: (cy, cypress) => {
             /**
             * Called between page load and snapshot, for this endpoint only.
             * If this function isn't specified, the global onVisit function will be used.
             * Use the globalOnVisitFunction to call the global onVisit function.
             */
        },
    },
];

const formatUrl = (path: string) => {
    /**
     * Optional.
     * Return a formatted url to visit.
     * If this function isn't specified or if it returns a nullish value, the baseUrl + endpoint.path will be used.
     */
    return '';
};

const onVisit: EndpointHookFunction = (cy, cypress) => {
    /**
     * Called between page load and snapshot, for all endpoints
     * Is overridden by the onVisit function in the endpoint object.
     */ 
};

runVisreg({
    baseUrl,
    endpoints,
    viewports,
    formatUrl,
    onVisit,
} as TestConfig);

