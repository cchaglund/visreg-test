import {defineConfig} from 'cypress'
import {addMatchImageSnapshotPlugin} from 'cypress-image-snapshot-fork-2/plugin';
import * as fs from 'fs';

console.log("\nCurrent working directory: ", process.cwd());

// check if file "./cypress/support/e2e.js" exists:
console.log("process.env.PROJECT_DIR", process.env.PROJECT_DIR);
console.log("Does file 'PROJECT_DIR/._this_folder_is_not_used_but_is_needed_for_cypress_to_work' exist?", fs.existsSync(process.env.PROJECT_DIR + '/._this_folder_is_not_used_but_is_needed_for_cypress_to_work'));
console.log("2", process.env.PROJECT_DIR + '/._this_folder_is_not_used_but_is_needed_for_cypress_to_work');


export default defineConfig({
	e2e: {
		/**
		 * This folder is not used, but we need to set it to something to be able to place images
		 * in the non-default cypress/e2e folder. But the snapshot plugin will not actually use it (it will create 
		 * a folder structure dynamically instead), but with it it knows where to place the images.
		*/
		screenshotsFolder: process.env.PROJECT_DIR + '/._this_folder_is_not_used_but_is_needed_for_cypress_to_work', // when local
		specPattern: process.env.PROJECT_DIR + '/**/*.cy.js', // when local
		
		// screenshotsFolder: '/Users/christoferhaglund/Code/misc/suites/._this_folder_is_not_used_but_is_needed_for_cypress_to_work', // when local
		// specPattern: '/Users/christoferhaglund/Code/misc/suites/**/*.cy.js', // when local


		// supportFile: 'dist/cypress/support/e2e.js', // when local

		// screenshotsFolder: '../._this_folder_is_not_used_but_is_needed_for_cypress_to_work', // when npm package
		// specPattern: '../**/*.cy.js', // when npm package
		// supportFile: 'node_modules/visreg/dist/cypress/support/e2e.js', // when as npm package

		responseTimeout: 60000,
		screenshotOnRunFailure: false,

		setupNodeEvents(on, config) {
			// console.log('CONFIG: ', config);
			
			on('before:browser:launch', (browser, launchOptions) => {

				if (browser.name === 'electron' && browser.isHeadless) {
					// Max possible screenshot size is 1920x1080. For larger screenshots this needs to be increased.
					launchOptions.preferences.width = 1920;
					launchOptions.preferences.height = 1080;
				}

				return launchOptions;
			});

			on('task', {
				readFileMaybe(filename) {
					if (!fs.existsSync('./cypress/snapshots/' + filename)) return null;
					return fs.readFileSync(filename, 'utf8');
				},
			})

			addMatchImageSnapshotPlugin(on);
		},
	},
});
