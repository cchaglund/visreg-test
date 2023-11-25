// Visual regression tests

import { CypressImageSnapshotOptions, SnapshotOptions } from '@simonsmith/cypress-image-snapshot/types';

const sizes = [
    'samsung-s10',
    'ipad-2',
    [1920, 1080],
    // 'iphone-6'
];

const pages = [
    ['Start', '/'],
    ['Events', '/events'],
    ['Event (single)', '/events/gpr-live-achieving-successful-freehands-speech-with-a-multi-disciplinary-approach'],
    ['Blog and News', '/blogs-and-news'],
    ['Blog and News (single)', '/news/meet-peter-a-provox-life-user-from-sweden'],
    ['Products', '/products'],
    ['Product (single)', '/products/tracoe-stoma-button'],
    ['Tracheostomy', '/tracheostomy'],
    ['Laryngectomy', '/laryngectomy'],
    ['Contact Us', '/contact-us'],
    ['IFU', '/ifu'],
    ['ISkia Products', '/iskia-products'],
    ['IFU Complete List', '/ifu-complete-list'],
    ['Healthcare Professionals', '/healthcare-professionals'],
    ['Evidence & Experience', '/healthcare-professionals/evidence-experience'],
    ['Tracheostomy Percutaneous Dilation', '/healthcare-professionals/tracheostomy/percutaneous-dilation'],
    ['Product Solutions', '/healthcare-professionals/tracheostomy/product-solutions'],
    ['Atos Learning Institute', '/healthcare-professionals/atos-learning-institute'],

    // [ 'TEST', '/services/atos-mylife-app' ]
    // [ 'TEST', '/services/emergency-card' ]
];


const captureProcess = (url, size) => {
    cy.setResolution(size);
    cy.visit(`${Cypress.env('baseUrlProduction')}${url}?noexternal=true`);
    cy.get('header').invoke('css', 'opacity', 0);
    cy.scrollTo('bottom', { duration: 1000 });
    cy.scrollTo('top');
};

describe('Visual regression', () => {

    sizes.forEach((size) => {
        pages.forEach((page) => {
            const title = page[ 0 ];
            const url = page[ 1 ];

            it(`Snapshots '${title}' @ ${size}`, () => {
                captureProcess(url, size);
                cy.matchImageSnapshot(`'${title}' @ ${size}`);
            });
        });
    });


    it('Create snaps of diffing pages', () => {
        cy.task('filenamesInDirectory', '/snapshots/visual-regression.cy.ts/__diff_output__')
            .then((diffingPageSnapshots: string[]) => {

                cy.log('Start creating snaps of diffing pages');
                cy.log(JSON.stringify(diffingPageSnapshots))

                diffingPageSnapshots.forEach(diffSnap => {
                    cy.log(diffSnap);

                    let titleMatch = diffSnap.match(/'([^']*)'/); // match anything between two apostrophes
                    const title = titleMatch ? titleMatch[ 1 ] : '';

                    cy.log(title);

                    const deviceOrDimensionsStringMatch = diffSnap.match(/@ (.*)\.diff/); // match anything after "@ " and before ".snap"
                    const deviceOrDimensionString = deviceOrDimensionsStringMatch ? deviceOrDimensionsStringMatch[ 1 ] : '';

                    const isDeviceString = !deviceOrDimensionString.includes(',');
                    const sizeString = isDeviceString && deviceOrDimensionString;
                    const sizeArray = !isDeviceString && deviceOrDimensionString.split(',').map(dimension => parseInt(dimension));

                    const page = pages.find(page => page[ 0 ] === title);

                    if (!page) {
                        return;
                    }
                    
                    const url = page[ 1 ];
                    const size = sizeString || sizeArray;
                    
                    cy.log(JSON.stringify(page));
                    cy.log(JSON.stringify(isDeviceString));
                    cy.log(deviceOrDimensionString);
                    cy.log(url);
                    cy.log(JSON.stringify(size));

                    captureProcess(url, size)

                    const options: Partial<SnapshotOptions> = {
                        /**
                         * This will create new snapshots for every page. Ideally we'd only 
                         * do this for those pages that have changed/have a diff, but it doesn't 
                         * seem possible to
                         */
                        // screenshotsFolder: '../snapshots/updated',
                        snapFilenameExtension: '.updated',
                        // isUpdateSnapshots: true,
                    }

                    cy.matchImageSnapshot(`'${title}' @ ${size}`, options);
                });

                cy.log('Done');
            })
    });
});
