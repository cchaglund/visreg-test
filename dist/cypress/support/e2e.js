"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./commands");
const command_1 = require("cypress-image-snapshot-fork-2/command");
const local_cypress_1 = require("local-cypress");
console.log('--- Does process.env.PROJECT_DIR exist here?', process.env.PROJECT_DIR);
(0, command_1.addMatchImageSnapshotCommand)({
    failureThreshold: 1,
    failureThresholdType: 'percent',
    capture: 'fullPage',
    blackout: [''],
    snapFilenameExtension: '.base',
    // e2eSpecDir: '/Users/christoferhaglund/Code/misc/suites/',
    // e2eSpecDir: '/Users/christoferhaglund/Code/misc/suites/wtf',
    // e2eSpecDir: '24hr',
    // e2eSpecDir: Cypress.env('projectDir'),
    // customSnapshotsDir: Cypress.env('projectDir') + '/snapshots',
    useRelativeSnapshotsDir: true,
    // e2eSpecDir: "suites",
    // customSnapshotsDir: "snapshots",
    // e2eSpecDir: "../../suites",
    // customSnapshotsDir: "snapshots",
});
// let e2eSpecDir = /.*\/(.*)\/.*/;
// let str = "../../suites/24hr/snaps.cy.js";
// let result = str.replace(e2eSpecDir, '$1');
local_cypress_1.Cypress.on('uncaught:exception', () => {
    /**
     * returning false here prevents Cypress from failing the test if an error
     * in the console of the application which is being tested is found
     */
    return false;
});
