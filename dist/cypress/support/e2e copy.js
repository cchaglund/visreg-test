"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./commands");
const command_1 = require("@simonsmith/cypress-image-snapshot/command");
const local_cypress_1 = require("local-cypress");
(0, command_1.addMatchImageSnapshotCommand)({
    failureThreshold: 1,
    failureThresholdType: 'percent',
    capture: 'fullPage',
    blackout: [''],
    snapFilenameExtension: '.base',
    e2eSpecDir: '/Users/christoferhaglund/Code/misc/suites/',
});
local_cypress_1.Cypress.on('uncaught:exception', () => {
    /**
     * returning false here prevents Cypress from failing the test if an error
     * in the console of the application which is being tested is found
     */
    return false;
});
