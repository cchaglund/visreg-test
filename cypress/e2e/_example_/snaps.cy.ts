import { runTest } from '../visual-regression-tests.cy.ts';
import { diffs } from './diff_list.ts';
import endpoints from './endpoints.ts';
import viewports from './viewports.ts';

const suiteName = 'Example';
const baseUrl = 'https://docs.cypress.io';

/**
 * @description
 * Can be used to format the URL, e.g. to add query params.
 * Removes trailing slash from baseUrl in case there is one.
 */
const formatUrl = (path: string) => {
    const baseUrlClean = baseUrl.replace(/\/$/, '');
    return `${baseUrlClean}${path}`;
}

/**
 * @description
 * Can be used to prepare the page for snapshot, e.g. by hiding elements or
 * clicking to bypass cookie banners:
 * 
 * cy.get('header').invoke('css', 'opacity', 0);
 * cy.get('body').invoke('css', 'height', 'auto');
 */
const onPageVisit = () => {
    return;
}

runTest({
    suiteName,
    endpoints,
    viewports,
    formatUrl,
    onPageVisit,
    diffs,
});