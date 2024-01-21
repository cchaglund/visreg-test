import { cy, Cypress } from 'local-cypress'
import { PrepareForCaptureSettings } from 'src/types';
import 'cypress-set-device-pixel-ratio';
import 'cypress-network-idle';

Cypress.Commands.add('prepareForCapture', (props: PrepareForCaptureSettings) => {
    const { fullUrl, viewport, onPageVisitFunctions, fullPageCapture, options } = props;

    cy.setDevicePixelRatio(options.devicePixelRatio || 1);
    cy.setResolution(viewport);
    cy.visit(fullUrl, {
        failOnStatusCode: options.failOnStatusCode ?? true,
    });

    onPageVisitFunctions?.forEach((fn) => fn && fn(cy, Cypress));
    
    const scrollSettings = {
        duration: options.scrollDuration || 750,
        ensureScrollable: false,
    }

    if (fullPageCapture) {
        cy.scrollTo('bottom', scrollSettings);
        cy.scrollTo('top', scrollSettings);
        cy.waitForNetworkIdle(2000, { log: false })
        return;
    }     

    cy.window().then(win => {
        // We scroll a little even if capture is set to viewport, to trigger any lazy loading/interscetion observer.
        cy.scrollTo(0, win.innerHeight, scrollSettings);
        cy.scrollTo('top', scrollSettings);
        cy.waitForNetworkIdle(2000, { log: false })
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
