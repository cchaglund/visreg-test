import '../support/commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot-fork-2/command';
import { cy, Cypress, describe, it } from 'local-cypress';
import { Endpoint, EnvsPassedViaCypress, SnapConfig, TestConfig, VisregViewport } from '../../types';

addMatchImageSnapshotCommand();

Cypress.on('uncaught:exception', () => {
	/**
	 * returning false here prevents Cypress from failing the test if an error 
	 * in the console of the website which is being tested is found
	 */
	return false
})


const parseSnapConfigFromName = (name: string, endpoints: Endpoint[]): SnapConfig | null => {
    const divider = '@';
    const nameParts = name.split(divider);
    const title = nameParts[0].trim();
    const sizeRaw = nameParts[1].trim().replace('.diff.png', '') as Cypress.ViewportPreset;

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
}

const takeSnaps = (props: TestConfig, viewport: VisregViewport, endpoint: Endpoint, noSnap?: boolean) => {
    const { onPageVisit } = props;

    const {
        path,
        title,
        elementToMatch,
        excludeFromTest,
        onBefore,
        onEndpointVisit,
        onCleanup,
        ...endpointOptions
    } = endpoint;

    const options = {
        ...Cypress.env('NON_OVERRIDABLE_SETTINGS'),
        ...Cypress.env('SNAPSHOT_SETTINGS'),
        ...endpointOptions,
    };

    const snapName = `${title} @ ${viewport}`;
    const fullUrl = getFullUrl(props, path);

    const context = {
        endpoint,
        viewport,
        cypress: Cypress
    }

    it(snapName, () => {
        if (excludeFromTest && excludeFromTest(cy, context)) {
            return;
        }

        if (onBefore) {
            onBefore(cy, context);
        }

        cy.prepareForCapture({
            fullUrl,
            viewport,
            onPageVisitFunctions: [onPageVisit, onEndpointVisit],
            fullPageCapture: !(elementToMatch || options.capture === 'viewport'),
            context,
            options,
        });

        if (!noSnap) {
            const cyTarget = elementToMatch ? cy.get(elementToMatch) : cy;
            cyTarget.matchImageSnapshot(snapName, options);
        }        

        if (onCleanup) {
            onCleanup(cy, context);
        }
    });
};

const limitMessage = (endpoints: Endpoint[], viewports: VisregViewport[], endpointTitle: string | undefined, viewport: VisregViewport | undefined) => {
    const ep = endpointTitle && endpoints.length === 1 && matchingEndpointTitle(endpoints[0].title, endpointTitle)
        ? endpoints[0].title
        : '';

    const vp = viewport && viewports.length === 1 && matchingViewport(viewports[0], viewport)
        ? viewport
        : '';

    const epText = ep ? `"${ep}" ` : '';
    const vpText = vp ? `@ ${vp}` : '';
    const limitText = epText || vpText ? ` - limiting test to ${epText}${vpText}` : '';
    return limitText;
}

const allowedViewports = (viewports: VisregViewport[], viewport: VisregViewport | undefined) => {
    if (!viewport) return viewports;

    const match = viewports.find(vp => {
        if (typeof vp === 'string' && typeof viewport === 'string' ) {
            return vp === viewport;
        }

        if (Array.isArray(vp) && Array.isArray(viewport)) {
            return vp.toString() === viewport.toString()
        }

        return false;
    });

    if (!match) return [];

    return [match]
}

const matchingEndpointTitle = (endpoint1: string | undefined, endpoint2: string | undefined) => {
    if (!endpoint1 || !endpoint2) return '';
    const normalized1 = endpoint1.toLowerCase().replace(/ /g, '-');
    const normalized2 = endpoint2.toLowerCase().replace(/ /g, '-');
    return normalized1 === normalized2;
}

const matchingViewport = (viewport1: any, viewport2: any) => {
    if (!viewport1 || !viewport2) return '';
    const normalized1 = JSON.stringify(viewport1);
    const normalized2 = JSON.stringify(viewport2);
    return normalized1 === normalized2;
}

const allowedEndpoints = (endpoints: Endpoint[], endpointTitle: string | undefined) => {
    if (!endpointTitle) return endpoints;
    const match = endpoints.find(ep => matchingEndpointTitle(endpointTitle, ep.title));
    if (!match) return [];
    
    return [match]
}

export const runTest = (props: TestConfig): void => {
    const defaultViewports: VisregViewport[] = [
        'iphone-6',
        'ipad-2',
        [1920, 1080],
    ];

    const envs: EnvsPassedViaCypress = {
        ...JSON.parse(Buffer.from(Cypress.env('TEST_SETTINGS'), 'base64').toString('utf8'))
    }

    const {
        suite,
        viewport,
        endpointTitle,
        testType,
        diffList,
        noSnap,
    } = envs;    

    const { 
        suiteName = props.suiteName ?? suite,
        viewports: registeredViewports = props.viewports ?? defaultViewports,
        endpoints: registeredEndpoints,
    } = props;

    const viewportsToTest = allowedViewports(registeredViewports, viewport)
    const endpointsToTest = allowedEndpoints(registeredEndpoints, endpointTitle)
    const limitText = limitMessage(endpointsToTest, viewportsToTest, endpointTitle, viewport);

    describe(`${suiteName}`, () => {

        if (testType === 'lab') {
            describe('Lab' + limitText, () => {
                /**
                 * Lab tests require a viewport and endpoint to be specified.
                 * Viewport can be anything in lab mode, but endpoint must still be a valid endpoint.
                 */
                const validEndpoint = endpointsToTest.find(ep => matchingEndpointTitle(ep.title, endpointTitle));
                if (!viewport || !validEndpoint) return;
                takeSnaps(props, viewport, validEndpoint, noSnap)
            });
        }

        if (testType === 'full-test') {
            describe('Full visual regression test' + limitText, () => {
                viewportsToTest.forEach((vp) => {
                    endpointsToTest.forEach((ep) => {
                        takeSnaps(props, vp, ep, noSnap)
                    });
                });
            });
        }

        if (testType === 'targetted') {
            describe('Targetted test' + limitText, () => {
                viewportsToTest.forEach((vp) => {
                    endpointsToTest.forEach((ep) => {
                        takeSnaps(props, vp, ep, noSnap)
                    });
                });
            });
        }
        
        if (testType === 'diffs-only') {
            describe('Retesting diffing snapshots only' + limitText, () => {
                if (!diffList) return;

                diffList.forEach(diffSnapName => {
                    const config = parseSnapConfigFromName(diffSnapName, endpointsToTest)
                    
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
}
