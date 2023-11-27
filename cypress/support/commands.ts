
// Add all the fixtures command here
Cypress.Commands.add('setFixtureData', () => {
    cy.fixture('urls').as('urlFixture');
    cy.get('@urlFixture').then((urls) => {
        globalThis.urls = urls;
    });
});

Cypress.Commands.add('prepareForCapture', (url, size) => {
    cy.log(`Preparing for capture of ${url} @ ${size}`);
    cy.setResolution(size);
    const { baseUrlProduction } = globalThis.urls;
    cy.visit(`${baseUrlProduction}${url}?noexternal=true`);
    cy.get('header').invoke('css', 'opacity', 0);
    cy.scrollTo('bottom', { duration: 1000 });
    cy.scrollTo('top');
});


Cypress.Commands.add("parseSnapConfigFromName", (name, pages) => {
    let titleMatch = name.match(/'([^']*)'/);
    const title = titleMatch ? titleMatch[ 1 ] : '';

    const deviceOrDimensionsStringMatch = name.match(/@ (.*)\.diff/); // match anything after "@ " and before ".snap"
    const deviceOrDimensionString = deviceOrDimensionsStringMatch ? deviceOrDimensionsStringMatch[ 1 ] : '';

    const isDeviceString = !deviceOrDimensionString.includes(',');
    const viewportPreset = isDeviceString && deviceOrDimensionString as Cypress.ViewportPreset;
    const dimensionArray = !isDeviceString && deviceOrDimensionString.split(',').map(dimension => parseInt(dimension));

    cy.log('viewport preset: ' + viewportPreset);
    const page = pages[title];

    if (page) {
        const result = {
            url: page.url,
            size: viewportPreset || dimensionArray,
            title,
        };
    
        return cy.wrap(result);
    }
    
});

Cypress.Commands.add("setResolution", (size) => {
	if (Cypress._.isArray(size)) {
		cy.viewport(size[ 0 ], size[ 1 ]);
	} else {
        cy.log(JSON.stringify(size == undefined))
		cy.viewport(size);
	}
});