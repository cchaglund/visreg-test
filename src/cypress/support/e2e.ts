import './commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot-fork-2/command';
import { Cypress } from 'local-cypress'

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

console.log('--- Does process.env.PROJECT_DIR exist here?', process.env.PROJECT_DIR);


addMatchImageSnapshotCommand({
	failureThreshold: 1,
	failureThresholdType: 'percent',
	capture: 'fullPage',
	blackout: [''],
	snapFilenameExtension: '.base',
	// e2eSpecDir: '/Users/christoferhaglund/Code/misc/suites/',
	// e2eSpecDir: '/Users/christoferhaglund/Code/misc/suites/wtf',
	// e2eSpecDir: '24hr',

	// e2eSpecDir: Cypress.env('projectDir'),
	// customSnapshotsDir: Cypress.env('projectDir') + '/snapshots',

	useRelativeSnapshotsDir: true,
	
	
	// e2eSpecDir: "suites",
	// customSnapshotsDir: "snapshots",

	// e2eSpecDir: "../../suites",
	// customSnapshotsDir: "snapshots",
});

// let e2eSpecDir = /.*\/(.*)\/.*/;
// let str = "../../suites/24hr/snaps.cy.js";
// let result = str.replace(e2eSpecDir, '$1');

Cypress.on('uncaught:exception', () => {
	/**
	 * returning false here prevents Cypress from failing the test if an error 
	 * in the console of the application which is being tested is found
	 */
	return false
})

