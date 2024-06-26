import '../support/commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot-fork-2/command';
import { before, cy, Cypress, describe, it } from 'local-cypress';
import { Endpoint, TestSettings, SnapConfig, TestConfig, VisregViewport, VisitSettings, RequestSettings, NonOverridableSettings, CypressScreenshotOptions, JestMatchImageSnapshotOptions, TestContext } from '../../types';

addMatchImageSnapshotCommand();

Cypress.on('uncaught:exception', () => {
    /**
     * returning false here prevents Cypress from failing the test if an error 
     * in the console of the website which is being tested is found
     */
    return false;
});


const parseSnapConfigFromName = (name: string, endpoints: Endpoint[]): SnapConfig | null => {
    const divider = '@';
    const nameParts = name.split(divider);
    const title = nameParts[ 0 ].trim();
    const sizeRaw = nameParts[ 1 ].trim().replace('.diff.png', '') as Cypress.ViewportPreset;

    let viewportSize: VisregViewport = sizeRaw;
    if (sizeRaw.includes(',')) {
        viewportSize = sizeRaw.split(',').map(dimension => parseInt(dimension));
    }

    const endpoint = endpoints.find(endpoint => endpoint.title === title);
    if (!endpoint) return null;

    return {
        path: endpoint.path,
        viewportSize,
        title,
    };
};

const getFullUrl = (props: TestConfig, path: string) => {
    const { baseUrl, formatUrl } = props;
    const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');
    const formattedUrl = formatUrl && formatUrl(path);
    const fullUrl = formattedUrl && typeof formattedUrl === 'string' && formattedUrl !== ''
        ? formattedUrl
        : `${sanitizedBaseUrl}${path}`;
    return fullUrl;
};

const takeSnaps = (props: TestConfig, viewport: VisregViewport, endpoint: Endpoint, noSnap?: boolean) => {
    const {
        onBeforeVisit: beforeVisitGlobal,
        onVisit: onVisitGlobal,
        onAfterVisit: afterVisitGlobal,
    } = props;

    const {
        path,
        title,
        elementToMatch,
        excludeFromTest,
        onBeforeVisit,
        onVisit,
        onAfterVisit,
        requestOptions,
        visitOptions,
        ...endpointOptions
    } = endpoint;

    const snapshotSettings: NonOverridableSettings & CypressScreenshotOptions & JestMatchImageSnapshotOptions & Partial<Endpoint> = {
        ...Cypress.env('NON_OVERRIDABLE_SETTINGS'),
        ...Cypress.env('SNAPSHOT_SETTINGS'),
        ...endpointOptions,
    };

    const visitOptionsAggregate: VisitSettings = {
        ...Cypress.env('VISIT_SETTINGS'),
        ...visitOptions,
    }

    const requestOptionsAggregate: RequestSettings = {
        ...Cypress.env('REQUEST_SETTINGS'),
        ...requestOptions,
    }

    const snapName = `${title} @ ${viewport}`;
    const fullUrl = getFullUrl(props, path);

    const context: TestContext = {
        endpoint,
        viewport,
        cypress: Cypress,
        fullUrl,
        fullPageCapture: !(elementToMatch || snapshotSettings.capture === 'viewport'),
        requestOptions: requestOptionsAggregate,
        visitOptions: visitOptionsAggregate,
    };

    // Always have a callable global hook, to avoid errors when not defined
    const globalBeforeVisit = beforeVisitGlobal || (() => {});
    const globalOnVisit = onVisitGlobal || (() => {});
    const globalAfterVisit = afterVisitGlobal || (() => {});

    it(snapName, () => {
        if (excludeFromTest && excludeFromTest(cy, context)) return;

        // Endpoint hooks take precedence over global hooks (gets it passed as a parameter if user wants to call it)
        onBeforeVisit 
            ? onBeforeVisit(cy, context, globalBeforeVisit)
            : globalBeforeVisit(cy, context);

        cy.prepareForCapture({
            context,
            onVisit,
            globalOnVisit,
        });

        if (!noSnap) {
            const cyTarget = elementToMatch ? cy.get(elementToMatch) : cy;
            cyTarget.matchImageSnapshot(snapName, snapshotSettings);
        }

        // Endpoint hooks take precedence over global hooks (gets it passed as a parameter if user wants to call it)
        onAfterVisit
            ? onAfterVisit(cy, context, globalAfterVisit)
            : globalAfterVisit(cy, context);
    });
};

const limitMessage = (targetEndpointTitles?: string[], targetViewports?: VisregViewport[]) => {
    const eps = targetEndpointTitles && targetEndpointTitles.length > 0 ? targetEndpointTitles.join(', ') : '';
    const vps = targetViewports && targetViewports.length > 0 ? targetViewports.join(', ') : '';

    const epText = eps ? `"${eps}" ` : '';
    const vpText = vps ? `@ ${vps}` : '';
    const limitText = epText || vpText ? ` - limiting test to ${epText}${vpText}` : '';
    return limitText;
};

const allowedViewports = (registeredViewports: VisregViewport[], targetViewports?: VisregViewport[]) => {
    if (!targetViewports || targetViewports.length === 0) {
        return registeredViewports;
    }

    const matches = registeredViewports.filter(vp => {
        return targetViewports.find(targetVp => {
            if (typeof vp === 'string' && typeof targetVp === 'string') {
                return vp === targetVp;
            }

            if (Array.isArray(vp) && Array.isArray(targetVp)) {
                return vp.toString() === targetVp.toString();
            }

            return false;
        });
    });

    if (matches.length === 0) return [];
    return matches;
};

const allowedEndpoints = (endpoints: Endpoint[], targetEndpointTitles?: string[]) => {
    if (!targetEndpointTitles || targetEndpointTitles.length === 0) {
        return endpoints;
    }

    const matches = endpoints.filter(ep => {
        return targetEndpointTitles.find(targetTitle => matchingEndpointTitle(ep.title, targetTitle));
    });

    if (matches.length === 0) return [];
    return matches;
};


const matchingEndpointTitle = (endpoint1: string | undefined, endpoint2: string | undefined) => {
    if (!endpoint1 || !endpoint2) return '';
    const normalized1 = endpoint1.toLowerCase().replace(/ /g, '-');
    const normalized2 = endpoint2.toLowerCase().replace(/ /g, '-');
    return normalized1 === normalized2;
};

const matchingViewport = (viewport1: any, viewport2: any) => {
    if (!viewport1 || !viewport2) return '';
    const normalized1 = JSON.stringify(viewport1);
    const normalized2 = JSON.stringify(viewport2);
    return normalized1 === normalized2;
};


export const runTest = (props: TestConfig): void => {
    const defaultViewports: VisregViewport[] = [
        'iphone-6',
        'ipad-2',
        [ 1920, 1080 ],
    ];

    const testSettings: TestSettings = {
        ...JSON.parse(Buffer.from(Cypress.env('TEST_SETTINGS'), 'base64').toString('utf8'))
    };

    const {
        suite,
        targetViewports,
        targetEndpointTitles,
        testType,
        diffList,
        noSnap,
    } = testSettings;

    const {
        suiteName = props.suiteName ?? suite,
        viewports: registeredViewports = props.viewports ?? defaultViewports,
        endpoints: registeredEndpoints,
    } = props;

    const limitText = limitMessage(targetEndpointTitles, targetViewports);

    const viewportsToTest = allowedViewports(registeredViewports, targetViewports);
    const endpointsToTest = allowedEndpoints(registeredEndpoints, targetEndpointTitles);

    const testAgenda = {
        message: 'visreg-test-agenda',
        viewportsToTest,
        endpointsToTest,
    }

    before(() => {
        cy.log(JSON.stringify(testAgenda));
    });

    beforeEach(() => {
        if (Cypress.env('HEADED') || Cypress.env('CLI')) {
            return;
        }

        cy.request('http://localhost:3000/api/test/terminate-json')
            .then((response) => {
                if (response.body.terminate) {
                    throw new Error('Terminating tests');
                }
            });
    });

    describe(`Suite: "${suiteName}"`, () => {

        if (testType === 'lab') {
            describe('Lab mode' + limitText, () => {
                /**
                 * Lab tests require a viewport and endpoint to be specified.
                 * Viewport can be anything in lab mode, but endpoint must still be a valid endpoint.
                 */
                const validEndpoint = endpointsToTest.find(ep => matchingEndpointTitle(ep.title, targetEndpointTitles?.[ 0 ]));
                if (!targetViewports || !validEndpoint) return;
                takeSnaps(props, targetViewports?.[ 0 ], validEndpoint, noSnap);
            });
        }

        if (testType === 'full-test') {
            describe('Full test' + limitText, () => {
                viewportsToTest.forEach((vp) => {
                    endpointsToTest.forEach((ep) => {
                        takeSnaps(props, vp, ep, noSnap);
                    });
                });
            });
        }

        if (testType === 'targetted') {
            describe('Targetted' + limitText, () => {
                viewportsToTest.forEach((vp) => {
                    endpointsToTest.forEach((ep) => {
                        takeSnaps(props, vp, ep, noSnap);
                    });
                });
            });
        }

        if (testType === 'diffs-only') {
            describe('Diffs only' + limitText, () => {
                if (!diffList) return;

                diffList.forEach(diffSnapName => {
                    const config = parseSnapConfigFromName(diffSnapName, endpointsToTest);

                    if (!config) return;

                    const { viewportSize, title }: SnapConfig = config;

                    const viewport = viewportsToTest.find(vp => matchingViewport(vp, viewportSize));
                    const endpoint = endpointsToTest.find(ep => matchingEndpointTitle(ep.title, title));

                    if (viewport && endpoint) {
                        takeSnaps(props, viewportSize, endpoint, noSnap);
                    }
                });
            });
        }
    });
};
