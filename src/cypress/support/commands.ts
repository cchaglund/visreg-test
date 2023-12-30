import { cy, Cypress } from 'local-cypress'
import { PrepareForCaptureSettings } from 'src/types';

Cypress.Commands.add('prepareForCapture', (props: PrepareForCaptureSettings) => {
    const { fullUrl, viewport, onPageVisitFunctions, fullPageCapture, options } = props;

    cy.setResolution(viewport);
    cy.visit(fullUrl);
    onPageVisitFunctions?.forEach((fn) => fn && fn(cy, Cypress));
    
    const duration = options.scrollDuration ?? 1000;

    if (fullPageCapture) {
        cy.scrollTo('bottom', { duration, ensureScrollable: false });
        cy.scrollTo('top', { duration, ensureScrollable: false });
        return;
    }     

    cy.window().then(win => {
        cy.scrollTo(0, win.innerHeight, { duration: duration / 2, ensureScrollable: false });
        cy.scrollTo('top', { duration: duration / 2, ensureScrollable: false });
    });
});

Cypress.Commands.add('setResolution', (viewport) => {
	if (Cypress._.isArray(viewport)) {
		cy.viewport(viewport[ 0 ], viewport[ 1 ]);
	} else {
		cy.viewport(viewport);
	}
});

Cypress.Commands.overwrite('log', (originalFn, ...message) => {
    if (Cypress.config('isInteractive')) {
        return originalFn(JSON.stringify(message));
    } else {
        return cy.task('log', message);
    }
});
