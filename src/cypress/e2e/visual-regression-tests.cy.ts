import '../support/commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot-fork-2/command';
import { delimiter } from '../../shared';
import { cy, Cypress, describe, it } from 'local-cypress';
import { SnapshotOptions } from 'cypress-image-snapshot-fork-2/types';
import { Endpoint, SnapConfig, TestConfig, VisregViewport } from 'src/types';


addMatchImageSnapshotCommand({
	useRelativeSnapshotsDir: true,
	failureThreshold: 0.02,
	failureThresholdType: 'percent',
	snapFilenameExtension: '.base',
	capture: 'fullPage',
    storeReceivedOnFailure: true,
    ...Cypress.env('SCREENSHOT_OPTIONS') ? Cypress.env('SCREENSHOT_OPTIONS') : {},
    ...Cypress.env('COMPARISON_OPTIONS') ? Cypress.env('COMPARISON_OPTIONS') : {},
});


Cypress.on('uncaught:exception', () => {
	/**
	 * returning false here prevents Cypress from failing the test if an error 
	 * in the console of the website which is being tested is found
	 */
	return false
})


const parseSnapConfigFromName = (name: string, pages: Endpoint[]): SnapConfig | null => {
    const divider = ' @ ';
    const nameParts = name.split(divider);
    const title = nameParts[0];
    const sizeRaw = nameParts[1].replace('.diff.png', '') as Cypress.ViewportPreset;

    let size: VisregViewport = sizeRaw;
    if (sizeRaw.includes(',')) {
        size = sizeRaw.split(',').map(dimension => parseInt(dimension));
    }
    
    const page = pages.find(page => page.title === title);
    if (!page) return null;

    return {
        path: page.path,
        size,
        title,
    };    
};

const defaultViewports: VisregViewport[] = [
    'iphone-6',
    'ipad-2',
    [1920, 1080],
];


const defaultOptions: Partial<SnapshotOptions> = {
    blackout: [],
    capture: 'fullPage',
    padding: 0,
};

type EnvsPassedViaCypress = {
    testType: 'test-all' | 'retest-diffs-only';
    target: string;
    screenshotOptions?: SnapshotOptions;
    diffList?: string;
}

const takeSnaps = (props: TestConfig, env: EnvsPassedViaCypress, viewport: VisregViewport, endpoint: Endpoint) => {
    const { baseUrl, formatUrl, onPageVisit, } = props;

    const {
        path,
        title,
        elementToMatch,
        onEndpointVisit,
        capture = endpoint.capture ?? env.screenshotOptions?.capture,
        ...rest
    } = endpoint;

    const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');
    const snapName = `${title} @ ${viewport}`;
    const fullUrl = formatUrl ? formatUrl(path) : `${sanitizedBaseUrl}${path}`;

    const options = {
        ...defaultOptions,
        capture,
        ...rest,
    };

    it(snapName, () => {
        cy.prepareForCapture({
            fullUrl,
            viewport,
            onPageVisitFunctions: [onPageVisit, onEndpointVisit],
            skipScrolling: !!(elementToMatch || capture === 'viewport'),
        });

        if (elementToMatch) {
            cy.get(elementToMatch).matchImageSnapshot( snapName, options);
        } else {
            cy.matchImageSnapshot( snapName, options);
        }
    });
};


export const runTest = (props: TestConfig): void => {
    const env: EnvsPassedViaCypress = {
        testType: Cypress.env('testType'),
        target: Cypress.env('target'),
        screenshotOptions: Cypress.env('SCREENSHOT_OPTIONS'),
        diffList: Cypress.env('diffListString'),
    }

    const { 
        suiteName = props.suiteName ?? env.target,
        viewports = props.viewports ?? defaultViewports,
        endpoints,
    } = props;


    describe(`Visual regression - ${suiteName}`, () => {

        if (env.testType === 'test-all') {
            describe('Full visual regression test', () => {
                viewports.forEach((size) => {
                    endpoints.forEach((endpoint) => {
                        takeSnaps(props, env, size, endpoint)
                    });
                });
            });
        }
        
        if (env.testType === 'retest-diffs-only') {
            describe('Retesting diffing snapshots only', () => {
                if (!env.diffList) return;

                const decodedString = Buffer.from(env.diffList, 'base64').toString('utf8');
                const diffs = decodedString.split(delimiter);

                diffs.forEach(diffSnapName => {
                    const config = parseSnapConfigFromName(diffSnapName, endpoints)
                    if (!config) return;

                    const { size, title }: SnapConfig = config;
                    const endpoint = endpoints.find(endpoint => endpoint.title === title);
                    if (!endpoint) return;

                    takeSnaps(props, env, size, endpoint);
                });
            });
        }
    });
}
