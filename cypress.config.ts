import {defineConfig} from 'cypress'
import {addMatchImageSnapshotPlugin} from '@simonsmith/cypress-image-snapshot/plugin'
import * as fs from 'fs';

// If you want to see the browser's internal logs, prefix your "npx cypress [...]" command with "ELECTRON_ENABLE_LOGGING=1 

export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			/**
			 * Perhaps I don't need this, and can do it this way instead: 
			 * https://docs.cypress.io/api/cypress-api/screenshot-api#Scale-viewport-and-fullPage-captures
			 */
			on('before:browser:launch', (browser, launchOptions) => {
				if (browser.name === 'chrome' && browser.isHeadless) {
					// fullPage screenshot size is 1920x1080 on non-retina screens and 3840x2160 on retina screens
					launchOptions.args.push('--window-size=1920,1080');

					// force screen to be non-retina
					launchOptions.args.push('--force-device-scale-factor=1');

					// force screen to be retina
					// launchOptions.args.push('--force-device-scale-factor=2')
				}

				if (browser.name === 'electron' && browser.isHeadless) {
					// fullPage screenshot size is 1920x1080
					launchOptions.preferences.width = 1920;
					launchOptions.preferences.height = 1080;
				}

				return launchOptions;
			});

			on('task', {
				filenamesInDirectory(directoryPath) {
					const dirpath = './cypress' + directoryPath;
					return fs.existsSync(dirpath) ? fs.readdirSync(dirpath) : [];
				},
			})

			addMatchImageSnapshotPlugin(on);
		},
		// specPattern: 'cypress/e2e/*.cy.{js,jsx,ts,tsx}',
		viewportWidth: 1920,
		viewportHeight: 1080,
		responseTimeout: 60000,
		screenshotOnRunFailure: false,
		env: {
			baseUrlProduction: 'https://www.atosmedical.com',
			// failOnSnapshotDiff: false,
		},
	},
});
