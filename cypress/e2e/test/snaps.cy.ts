import { endpoints } from './endpoints.ts';
import { viewports } from './viewports.ts';
import { diffs } from './diff_list.ts';
import { runDiffingTest, runTest } from '../helpers.cy.ts';

const suiteName = '24hr.se';
const baseUrl = 'https://www.24hr.se';

describe(`Visual regression (${suiteName})`, () => {

    const formatUrl = (path: string) => {
        const baseUrlClean = baseUrl.replace(/\/$/, '');
        return `${baseUrlClean}${path}?noexternal=true`;
    }

    const onPageVisit = () => {
        cy.get('body').invoke('css', 'height', 'auto');
    }

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

