import { runTest } from '../visual-regression-tests.cy.ts';
import endpoints from './endpoints.ts';
import viewports from './viewports.ts';

/**
 * 
 * Only the baseUrl and endpoints are required.
 * 
 */

const suiteName: string | undefined = 'Example';
const baseUrl: string = 'https://docs.cypress.io';

/**
 * @description
 * Optional
 * Can be used to format the URL, e.g. to add query params.
 */
type FormatUrl = ((path: string) => string) | undefined;
const formatUrl: FormatUrl = (path) => {
    return `${baseUrl}${path}`;
}

/**
 * @description
 * Optional
 * Can be used to prepare the page for snapshot, e.g. by hiding elements or clicking to bypass cookie banners.
 * 
 * cy.get('header').invoke('css', 'opacity', 0);
 * cy.get('body').invoke('css', 'height', 'auto');
 */
type OnPageVisit = (() => void) | undefined;
const onPageVisit: OnPageVisit = () => {
    return;
}

runTest({
    baseUrl,
    endpoints,
    suiteName,
    viewports,
    formatUrl,
    onPageVisit,
});