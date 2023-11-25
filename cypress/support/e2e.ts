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
			 * Custom command to select DOM element by data-cy attribute.
			 * @example cy.setResolution('samsung-s10' | [1920, 1080])
			 */
			setResolution(value: ViewportPreset | number[]): Chainable<JQuery<HTMLElement>>;
		}
	}
}

addMatchImageSnapshotCommand({
	failureThreshold: 0.1,
	failureThresholdType: 'percent',
	customDiffConfig: { threshold: 0.0 },
	capture: 'fullPage',
	// e2eSpecDir: 'cypress/e2e/'
});

Cypress.on('uncaught:exception', (err, runnable) => {
	/**
	 * returning false here prevents Cypress from failing the test if an error 
	 * in the console of the application which is being tested is found
	 */
	return false
})

Cypress.Commands.add("setResolution", (size) => {
	if (Cypress._.isArray(size)) {
		cy.viewport(size[ 0 ], size[ 1 ]);
	} else {
		cy.viewport(size);
	}
});