import { endpoints } from './endpoints.ts';
import { viewports } from './viewports.ts';
import { diffs } from './diff_list.ts';
import { runDiffingTest, runTest } from '../helpers.cy.ts';


const suiteName = 'Example';
const baseUrl = 'https://docs.cypress.io';

describe(`Visual regression (${suiteName})`, () => {

    /**
     * @description
     * Can be used to format the URL, e.g. to add query params.
     * Removes trailing slash from baseUrl in case there is one.
     * 
     * @example
     * const formatUrl = (path: string) => {
     *    const baseUrlClean = baseUrl.replace(/\/$/, '');
     *   return `${baseUrlClean}${path}?noexternal=true`;
     * }
     */
    const formatUrl = (path: string) => {
        const baseUrlClean = baseUrl.replace(/\/$/, '');
        return `${baseUrlClean}${path}`;
    }

    /**
     * @description
     * Can be used to prepare the page for snapshot, e.g. by hiding elements or clicking to bypass cookie banners.
     * 
     * @example
     * const onPageVisit = () => {
     *    cy.get('header').invoke('css', 'opacity', 0);
     *    cy.get('body').invoke('css', 'height', 'auto');
     * }
     */
    const onPageVisit = () => {
        return;
    }

    /**
     * @description
     * Runs a full visual regression test.
     */
    if (Cypress.env('test-all')) {
        it('Full visual regression test', () => {
            runTest({
                endpoints,
                viewports,
                formatUrl,
                onPageVisit,
            });
        });
    }

    /**
     * @description
     * Runs a test of the diffs only.
     */
    if (Cypress.env('retest-diffs-only')) {
        it('Retesting diffing snapshots only', () => {
            runDiffingTest({
                endpoints,
                formatUrl,
                onPageVisit,
                diffs,
            });
        });
    }

});

