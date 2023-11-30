Cypress.Commands.add('setFixtureData', () => {
    cy.fixture('urls').as('urlFixture');
    cy.get('@urlFixture').then((urls) => {
        globalThis.urls = urls;
    });
});

Cypress.Commands.add('prepareForCapture', (fullUrl, size, onPageVisit) => {
    cy.setResolution(size);
    cy.visit(fullUrl);
    onPageVisit();
    cy.scrollTo('bottom', { duration: 1000, ensureScrollable: false });
    cy.scrollTo('top', { ensureScrollable: false });
});

Cypress.Commands.add("setResolution", (size) => {
	if (Cypress._.isArray(size)) {
		cy.viewport(size[ 0 ], size[ 1 ]);
	} else {
        cy.log(JSON.stringify(size == undefined))
		cy.viewport(size);
	}
});