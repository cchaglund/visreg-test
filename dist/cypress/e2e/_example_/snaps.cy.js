"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visual_regression_tests_cy_1 = require("../visual-regression-tests.cy");
const endpoints_1 = require("./endpoints");
const viewports_1 = require("./viewports");
/**
 *
 * Only the baseUrl and endpoints are required.
 *
 */
const suiteName = 'Example';
const baseUrl = 'https://docs.cypress.io';
const formatUrl = (path) => {
    return `${baseUrl}${path}`;
};
const onPageVisit = () => {
    return;
};
(0, visual_regression_tests_cy_1.runTest)({
    baseUrl,
    endpoints: endpoints_1.default,
    suiteName,
    viewports: viewports_1.default,
    formatUrl,
    onPageVisit,
});
