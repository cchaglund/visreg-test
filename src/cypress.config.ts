import {defineConfig} from 'cypress'
import {addMatchImageSnapshotPlugin} from 'cypress-image-snapshot-fork-2/plugin';
import { inspect } from 'util';
import { maxViewportHeight, maxViewportWidth, projectRoot, timeouts } from './shared';

export default defineConfig({
	e2e: {
		specPattern: projectRoot + '/**/snaps.{js,ts}',
		supportFile: false,
		responseTimeout: 60000,
		screenshotOnRunFailure: false,
		...timeouts,
		// screenshotsFolder: path.join(process.env.PROJECT_DIR || '', programOptions.suite, 'orange'),
		setupNodeEvents(on, config) {
			on('before:browser:launch', (browser, launchOptions) => {
				if (browser.name === 'electron') {
					launchOptions.preferences.width = maxViewportWidth;
					launchOptions.preferences.height = maxViewportHeight
				}

				return launchOptions;
			});

			on('task', {
				log(messages) {
					const sanitizeMessages = messages.map((message: any) => {
						return typeof message === 'object'
							? inspect(
								message, 
								{ 
									showHidden: false,
									depth: null,
									colors: true
								})
							: `\x1b[36m${message}\x1b[0m`;
					});

					console.log('\n--- Logs ---');
					console.log(...sanitizeMessages);
					console.log('\n');

					return null;
				}
			})

			addMatchImageSnapshotPlugin(on);
		},
	},
});
