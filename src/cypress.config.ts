import {defineConfig} from 'cypress'
import {addMatchImageSnapshotPlugin} from 'cypress-image-snapshot-fork-2/plugin';
import { inspect } from 'util';
import { maxViewportHeight, maxViewportWidth, suitesDirectory, timeouts } from './shared';

export default defineConfig({
	e2e: {
		specPattern: suitesDirectory + '/**/snaps.{js,ts}',
		supportFile: false,
		responseTimeout: 60000,
		screenshotOnRunFailure: false,
		...timeouts,
		setupNodeEvents(on, config) {
			on('before:browser:launch', (browser, launchOptions) => {
				const width = maxViewportWidth;
				const height = maxViewportHeight;

				if (browser.name === 'chrome' && browser.isHeadless) {
					launchOptions.args.push(`--window-size=${width},${height}`);
					launchOptions.args.push('--disable-smooth-scrolling'); // potentially alleviates some issues with scroll behavior
				}

				if (browser.name === 'electron' && browser.isHeadless) {
					// might not work on CI for some reason
					launchOptions.preferences.width = width;
					launchOptions.preferences.height = height;
				}

				if (browser.name === 'firefox' && browser.isHeadless) {
					launchOptions.args.push(`--width=${width}`);
					launchOptions.args.push(`--height=${height}`);
				}

				return launchOptions
			})

			on('task', {
				log(messages) {
					const sanitizeMessages = messages.map((message: any) => {
						return typeof message === 'object'
							? inspect(
								message, 
								{ 
									showHidden: false,
									depth: null,
									colors: false
								})
							: message;
					});

					console.log(...sanitizeMessages);
					return null;
				}
			})

			addMatchImageSnapshotPlugin(on);
		},
	},
});
