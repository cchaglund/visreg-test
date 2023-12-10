"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cypress_1 = require("cypress");
const plugin_1 = require("cypress-image-snapshot-fork-2/plugin");
const fs = require("fs");
exports.default = (0, cypress_1.defineConfig)({
    e2e: {
        /**
         * This folder is not used, but we need to set it to something to be able to place images
         * in the non-default cypress/e2e folder. But the snapshot plugin will not actually use it (it will create
         * a folder structure dynamically instead), but with it it knows where to place the images.
        */
        specPattern: process.env.PROJECT_DIR + '/**/*.cy.js', // when local
        supportFile: false,
        // supportFile: 'dist/cypress/support/e2e.js', // when local
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
                readFileMaybe(filename) {
                    if (!fs.existsSync('./cypress/snapshots/' + filename))
                        return null;
                    return fs.readFileSync(filename, 'utf8');
                },
            });
            (0, plugin_1.addMatchImageSnapshotPlugin)(on);
        },
    },
});
