import { endpoints } from './endpoints.ts';
import { viewports } from './viewports.ts';
import { diffs } from './diff_list.ts';
import { runDiffingTest, runTest } from '../helpers.cy.ts';

const suiteName = 'Example';
const baseUrl = 'https://www.example.com'; // No trailing slash

describe(`Visual regression (${suiteName})`, () => {

    const formatUrl = (path: string) => {
        /**
         * Can be used to format the URL, e.g. to add query params
         */
        return `${baseUrl}${path}`;
    }

    const onPageVisit = () => {
        /**
         * Optional
         * After page load, prepare page for snapshot, e.g. by hiding elements
         * 
         * Example:
         * cy.get('header').invoke('css', 'opacity', 0);
         */
    }

    if (Cypress.env('test-all')) {
        runTest({
            endpoints,
            viewports,
            formatUrl,
            onPageVisit,
        });
    }

    if (Cypress.env('retest-diffs')) {
        runDiffingTest({
            endpoints,
            formatUrl,
            onPageVisit,
            diffs,
        });
    }

});

