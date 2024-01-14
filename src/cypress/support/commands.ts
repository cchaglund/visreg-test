import { cy, Cypress } from 'local-cypress'
import { PrepareForCaptureSettings } from 'src/types';
import 'cypress-set-device-pixel-ratio';

Cypress.Commands.add('scrollToBottom', (duration: number) => {
    cy.window().then((win) => {
        const beforeScrollHeight = win.document.documentElement.scrollHeight;
        cy.scrollTo('bottom', { duration, ensureScrollable: true });
        cy.wait(500 / 2); // wait for any potential loading
        cy.window().then((win) => {
            const afterScrollHeight = win.document.documentElement.scrollHeight;
            if (beforeScrollHeight !== afterScrollHeight) {
                cy.scrollToBottom(duration/2); // recursively call itself if the scroll height has changed
            }
        });
    });
});

Cypress.Commands.add('prepareForCapture', (props: PrepareForCaptureSettings) => {
    const { fullUrl, viewport, onPageVisitFunctions, fullPageCapture, options } = props;

    cy.setDevicePixelRatio(options.devicePixelRatio || 1);
    cy.setResolution(viewport);
    cy.visit(fullUrl, {
        failOnStatusCode: options.failOnStatusCode ?? true,
    });

    onPageVisitFunctions?.forEach((fn) => fn && fn(cy, Cypress));

    const duration = options.scrollDuration || 1000;
    
    if (fullPageCapture) {
        cy.scrollToBottom(duration);
        cy.wait(500);
        return;
    }     

    cy.window().then(win => {
        // We scroll a little even if capture is set to viewport, to trigger any lazy loading/interscetion observer.
        cy.scrollTo(0, win.innerHeight, { duration: duration / 2, ensureScrollable: true });
        cy.scrollTo('top', { duration: duration / 2, ensureScrollable: true });
        
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
