import { endpoints } from '../suites/production/endpoints.js';
import { viewports } from '../suites/production/viewports.js';


describe('Visual regression (Production)', () => {
    before(() => {
        cy.setFixtureData();
    });

    if (Cypress.env('test-all')) {
        viewports.forEach((size) => {
            Object.keys(endpoints).forEach((pageKey) => {
                const title = pageKey;
                const url = endpoints[pageKey].url;
    
                it(`Test page '${title}' @ ${size}`, () => {
                    cy.prepareForCapture(url, size);
                    cy.matchImageSnapshot(`'${title}' @ ${size}`);
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
                            cy.prepareForCapture(url, size)
        
                            cy.matchImageSnapshot(`'${title}' @ ${size}`, {
                                snapFilenameExtension: '.snap'
                            });
                        })

                });
            })
    });


    it('Capture high quality snapshots of the diffing pages', () => {
        if (!Cypress.env('capture-full-res-of-diffs')) return;

        cy.task('getDiffingFilenames')
            .then((diffingPageSnapshots: string[]) => {
                diffingPageSnapshots.forEach(diffSnapName => {
                    cy.parseSnapConfigFromName(diffSnapName, endpoints)
                        .then((snapDetails) => {
                            if (!snapDetails) {
                                return;
                            }
        
                            const { url, size, title } = snapDetails;
                            cy.prepareForCapture(url, size)
        
                            cy.matchImageSnapshot(`'${title}' @ ${size}`, {
                                snapFilenameExtension: '.updated'
                            });
                        })
                });
            })
    });

});
