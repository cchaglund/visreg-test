import { endpoints } from './endpoints.js';
import { viewports } from './viewports.js';


describe('Visual regression (Stage)', () => {
    before(() => {
        cy.setFixtureData();
    });

    if (Cypress.env('test-all')) {
        viewports.forEach((size) => {
            Object.keys(endpoints).forEach((pageKey) => {
                const title = pageKey;
                const path = endpoints[pageKey].url;
                const blackout = endpoints[pageKey].blackout;
    
                it(`Test page '${title}' @ ${size}`, () => {
                    const { stageBaseUrl } = globalThis.urls;
                    cy.prepareForCapture(stageBaseUrl, path, size);
                    cy.matchImageSnapshot(`'${title}' @ ${size}`, {
                        storeReceivedOnFailure: true,
                        blackout,
                    });
                });
            });
        });
    }


    it('Test only diffing pages', () => {
        if (!Cypress.env('retest-diffs')) return;

        cy.task('getDiffingFilenames')
            .then((diffingPageSnapshots: string[]) => {
                diffingPageSnapshots.forEach(diffSnapName => {
                    cy.parseSnapConfigFromName(diffSnapName, endpoints)
                        .then((snapDetails) => {
                            if (!snapDetails) {
                                return;
                            }
        
                            const { url, size, title } = snapDetails;
                            const endpoint = endpoints[title];
                            const blackout = endpoint.blackout;

                            const { stageBaseUrl } = globalThis.urls;
                            cy.prepareForCapture(stageBaseUrl, url, size)
        
                            cy.matchImageSnapshot(`'${title}' @ ${size}`, {
                                snapFilenameExtension: '.snap',
                                storeReceivedOnFailure: true,
                                blackout,
                            });
                        })

                });
            })
    });

});
