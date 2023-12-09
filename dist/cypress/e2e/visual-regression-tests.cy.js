"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTest = void 0;
const shared_1 = require("../../shared");
const local_cypress_1 = require("local-cypress");
const parseSnapConfigFromName = (name, pages) => {
    const divider = ' @ ';
    const nameParts = name.split(divider);
    const title = nameParts[0];
    const sizeRaw = nameParts[1].replace('.diff.png', '');
    let size = sizeRaw;
    if (sizeRaw.includes(',')) {
        size = sizeRaw.split(',').map(dimension => parseInt(dimension));
    }
    const page = pages.find(page => page.title === title);
    if (!page) {
        return null;
    }
    return {
        path: page.path,
        size,
        title,
    };
};
const defaultViewports = [
    'iphone-6',
    'ipad-2',
    [1920, 1080],
];
const runTest = (props) => {
    const { suiteName, baseUrl, endpoints, viewports, formatUrl, onPageVisit } = props;
    const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');
    const views = viewports ? viewports : defaultViewports;
    const name = suiteName ? suiteName : local_cypress_1.Cypress.env('target');
    (0, local_cypress_1.describe)(`Visual regression - ${name}`, () => {
        if (local_cypress_1.Cypress.env('testType') === 'test-all') {
            (0, local_cypress_1.describe)('Full visual regression test', () => {
                views.forEach((size) => {
                    endpoints.forEach((endpoint) => {
                        const { path, title, blackout } = endpoint;
                        const snapName = `${title} @ ${size}`;
                        const fullUrl = formatUrl ? formatUrl(path) : `${sanitizedBaseUrl}${path}`;
                        (0, local_cypress_1.it)(snapName, () => {
                            local_cypress_1.cy.prepareForCapture(fullUrl, size, onPageVisit);
                            local_cypress_1.cy.matchImageSnapshot(snapName, {
                                storeReceivedOnFailure: true,
                                blackout: blackout !== null && blackout !== void 0 ? blackout : [],
                            });
                        });
                    });
                });
            });
        }
        if (local_cypress_1.Cypress.env('testType') === 'retest-diffs-only') {
            (0, local_cypress_1.describe)('Retesting diffing snapshots only', () => {
                if (!local_cypress_1.Cypress.env('diffListString'))
                    return;
                const decodedString = Buffer.from(local_cypress_1.Cypress.env('diffListString'), 'base64').toString('utf8');
                const diffs = decodedString.split(shared_1.delimiter);
                diffs.forEach(diffSnapName => {
                    const config = parseSnapConfigFromName(diffSnapName, endpoints);
                    if (!config)
                        return;
                    const { path, size, title } = config;
                    const endpoint = endpoints.find(endpoint => endpoint.title === title);
                    if (!endpoint)
                        return;
                    const snapName = `${title} @ ${size}`;
                    const blackout = endpoint.blackout;
                    const fullUrl = formatUrl ? formatUrl(path) : `${sanitizedBaseUrl}${path}`;
                    (0, local_cypress_1.it)(snapName, () => {
                        local_cypress_1.cy.prepareForCapture(fullUrl, size, onPageVisit);
                        local_cypress_1.cy.matchImageSnapshot(snapName, {
                            snapFilenameExtension: '.base',
                            storeReceivedOnFailure: true,
                            blackout: blackout ? blackout : [],
                        });
                    });
                });
            });
        }
    });
};
exports.runTest = runTest;
