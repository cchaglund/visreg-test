import '../support/commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot-fork-2/command';
import { delimiter } from '../../shared';
import { cy, Cypress, describe, it } from 'local-cypress';

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to set the viewport to a specific device preset or [width, height].
			 * @example cy.setResolution('samsung-s10')
			 */
			setResolution(value: ViewportPreset | number[]): Chainable<JQuery<HTMLElement>>;

			/**
			 * Custom command to capture the full page
			 * @example cy.prepareForCapture('/home', 'samsung-s10')
			 */
			prepareForCapture(fullUrl: string, size: ViewportConfig, onPageVisit?: () => void): Chainable<JQuery<HTMLElement>>;
		}

		export type Endpoints = {
			title: string,
			path: string,
			blackout?: string[]
		}
		
		export type SnapConfig = {
			path: string;
			size: ViewportPreset | number[];
			title: string
		}

		export type ViewportConfig = ViewportPreset | number[];
	}

}

addMatchImageSnapshotCommand({
	failureThreshold: 1,
	failureThresholdType: 'percent',
	capture: 'fullPage',
	blackout: [''],
	snapFilenameExtension: '.base',
	useRelativeSnapshotsDir: true,
});


Cypress.on('uncaught:exception', () => {
	/**
	 * returning false here prevents Cypress from failing the test if an error 
	 * in the console of the application which is being tested is found
	 */
	return false
})


const parseSnapConfigFromName = (name: string, pages: Cypress.Endpoints[]): Cypress.SnapConfig | null => {
    const divider = ' @ ';
    const nameParts = name.split(divider);
    
    const title = nameParts[0];
    const sizeRaw = nameParts[1].replace('.diff.png', '') as Cypress.ViewportPreset;

    let size: Cypress.ViewportConfig = sizeRaw;
    if (sizeRaw.includes(',')) {
        size = sizeRaw.split(',').map(dimension => parseInt(dimension));
    }
    
    const page = pages.find(page => page.title === title);

    if (!page) {
        return null;
    }

    return {
        path: page.path,
        size,
        title,
    };    
};

const defaultViewports: Cypress.ViewportConfig[] = [
    'iphone-6',
    'ipad-2',
    [1920, 1080],
];

type TestProps = {
    suiteName: string;
    baseUrl: string;
    endpoints: Cypress.Endpoints[];
    viewports?: Cypress.ViewportConfig[];
    formatUrl?: (path: string) => string;
    onPageVisit?: () => void;
};

export const runTest = (props: TestProps): void => {
    const { suiteName, baseUrl, endpoints, viewports, formatUrl, onPageVisit } = props;

    const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');
    const views = viewports ? viewports : defaultViewports;
    const name = suiteName ? suiteName : Cypress.env('target');

    describe(`Visual regression - ${name}`, () => {

        if (Cypress.env('testType') === 'test-all') {
            describe('Full visual regression test', () => {
                views.forEach((size) => {
                    endpoints.forEach((endpoint) => {
                        const { path, title, blackout } = endpoint;
                
                        const snapName = `${title} @ ${size}`;
                        const fullUrl = formatUrl ? formatUrl(path) : `${sanitizedBaseUrl}${path}`;
                
                        it(snapName, () => {
                            cy.prepareForCapture(fullUrl, size, onPageVisit);
                
                            cy.matchImageSnapshot( snapName, {
                                storeReceivedOnFailure: true,
                                blackout: blackout ?? [],
                            });
                        });
                    });
                });
            });
        }
        
        
        if (Cypress.env('testType') === 'retest-diffs-only') {
            describe('Retesting diffing snapshots only', () => {
                if(!Cypress.env('diffListString')) return;

                const decodedString = Buffer.from(Cypress.env('diffListString'), 'base64').toString('utf8');
                const diffs = decodedString.split(delimiter);

                diffs.forEach(diffSnapName => {
                    const config = parseSnapConfigFromName(diffSnapName, endpoints)

                    if (!config) return;

                    const { path, size, title }: Cypress.SnapConfig = config;
                    const endpoint = endpoints.find(endpoint => endpoint.title === title);

                    if (!endpoint) return;

                    const snapName = `${title} @ ${size}`;
                    const blackout = endpoint.blackout;
                    const fullUrl = formatUrl ? formatUrl(path) : `${sanitizedBaseUrl}${path}`;
        
                    it(snapName, () => {
                        cy.prepareForCapture(fullUrl, size, onPageVisit);
        
                        cy.matchImageSnapshot(snapName, {
                            snapFilenameExtension: '.base',
                            storeReceivedOnFailure: true,
                            blackout: blackout ? blackout : [],
                        });
                    });
                });
            });
        }
    });
}
