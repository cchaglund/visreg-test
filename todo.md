- add warning/error if no file is found (we already handle if no folders are found)
- ensure that the create-symlink script works as intended
- test on linux - does it work?
- snaps.cy.js is the name of the test file - make it dynamic instead and allow for multiple test files, maybe?
- add support for the Cypress and imageSnapshotOptions options e.g.:
{
    "failureThreshold": 1,
    "failureThresholdType": "percent",
    "capture": "viewport",
    "blackout": [],
}

