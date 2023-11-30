import {defineConfig} from 'cypress'
import {addMatchImageSnapshotPlugin} from '@simonsmith/cypress-image-snapshot/plugin'
import * as fs from 'fs';

// If you want to see the browser's internal logs, prefix your "npx cypress [...]" command with "ELECTRON_ENABLE_LOGGING=1 

export default defineConfig({
	e2e: {
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
		responseTimeout: 60000,
		screenshotOnRunFailure: false,
	},
});
