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
        // We scroll a little even if capture is set to viewport, to trigger any lazy loading/interscetion observer.
        cy.scrollTo(0, win.innerHeight, { duration: duration / 2, ensureScrollable: false });
        cy.scrollTo('top', { duration: duration / 2, ensureScrollable: false });
        // Pause at top to allow scrollbar to disappear if it was present.
        cy.wait(100);
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
