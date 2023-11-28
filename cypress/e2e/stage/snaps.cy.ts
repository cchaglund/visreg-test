import { endpoints } from './endpoints.ts';
import { viewports } from './viewports.ts';
import { diffs } from './diff_list.ts';
import { runDiffingTest, runTest } from '../helpers.cy.ts';

const suiteName = 'Stage';
const baseUrl = 'https://draft.stage.atosmedical.24hr.se';


describe(`Visual regression (${suiteName})`, () => {

    const formatUrl = (path: string) => {
        return `${baseUrl}${path}?noexternal=true`;
    }

    const onPageVisit = () => {
        cy.get('header').invoke('css', 'opacity', 0);
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

