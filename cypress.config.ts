import {defineConfig} from 'cypress'
import {addMatchImageSnapshotPlugin} from '@simonsmith/cypress-image-snapshot/plugin'
import * as fs from 'fs';


export default defineConfig({
	e2e: {
		/**
		 * This folder is not used, but we need to set it to something to be able to place images
		 * in the correct folder. But Cypress/the snapshot plugin will not use it (it will create 
		 * a folder structure dynamically instead).
		*/
		screenshotsFolder: '/Users/christoferhaglund/Code/misc/suites/._this_folder_is_not_used_',
		specPattern: '/Users/christoferhaglund/Code/misc/suites/**/*.cy.js',
		responseTimeout: 60000,
		screenshotOnRunFailure: false,

		setupNodeEvents(on, config) {
			on('before:browser:launch', (browser, launchOptions) => {

				if (browser.name === 'electron' && browser.isHeadless) {
					// Max possible screenshot size is 1920x1080. For larger screenshots this needs to be increased.
					launchOptions.preferences.width = 1920;
					launchOptions.preferences.height = 1080;
				}

				return launchOptions;
			});

			on('task', {
				getDiffingFilenames() {
					if (!fs.existsSync('./cypress/support/diff_list.txt')) return [];
					const filenames = fs.readFileSync('./cypress/support/diff_list.txt', 'utf8')
					return filenames.split('\n');
				},
				readFileMaybe(filename) {
					if (!fs.existsSync('./cypress/snapshots/' + filename)) return null;
					return fs.readFileSync(filename, 'utf8');
				},
			})

			addMatchImageSnapshotPlugin(on);
		},
	},
});
