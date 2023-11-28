// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command';



// cypress/support/index.ts
declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to set the viewport to a specific device preset or [width, height].
			 * @example cy.setResolution('samsung-s10' | [1920, 1080])
			 */
			setResolution(value: ViewportPreset | number[]): Chainable<JQuery<HTMLElement>>;

			/**
			 * Custom command to set the fixture data to globalThis
			 * @example cy.setFixtureData()
			 */
			setFixtureData(): Chainable<JQuery<HTMLElement>>;

			/**
			 * Custom command to capture the full page
			 * @example cy.prepareForCapture('/home', 'samsung-s10' | [1920, 1080])
			 */
			prepareForCapture(fullUrl: string, size: ViewportConfig, onPageVisit: () => void): Chainable<JQuery<HTMLElement>>;
		}

		export type Endpoints = {
			[key: string]: {
				path: string,
				blackout: string[]
			}
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
	failureThreshold: 0.1,
	failureThresholdType: 'percent',
	capture: 'fullPage',
	blackout: [''],
	// e2eSpecDir: 'cypress/e2e/'
});

Cypress.on('uncaught:exception', (err, runnable) => {
	/**
	 * returning false here prevents Cypress from failing the test if an error 
	 * in the console of the application which is being tested is found
	 */
	return false
})

