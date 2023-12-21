import { cy, Cypress } from 'local-cypress'
import { PrepareForCaptureSettings } from 'src/types';

Cypress.Commands.add('prepareForCapture', (props: PrepareForCaptureSettings) => {
    const { fullUrl, viewport, onPageVisitFunctions, skipScrolling } = props;

    cy.setResolution(viewport);
    cy.visit(fullUrl);

    onPageVisitFunctions?.forEach((fn) => fn && fn(cy, Cypress));

    if (skipScrolling) return;

    cy.scrollTo('bottom', { duration: 1000, ensureScrollable: false });
    cy.scrollTo('top', { ensureScrollable: false });
});

Cypress.Commands.add("setResolution", (viewport) => {
	if (Cypress._.isArray(viewport)) {
		cy.viewport(viewport[ 0 ], viewport[ 1 ]);
	} else {
        cy.log(JSON.stringify(viewport == undefined))
		cy.viewport(viewport);
	}
});
