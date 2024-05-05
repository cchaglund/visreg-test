import { cy, Cypress } from 'local-cypress'
import { PrepareForCaptureSettings, VisregViewport } from 'src/types';
import 'cypress-set-device-pixel-ratio';
import 'cypress-network-idle';

type Headers = {
    [key: string]: string;
}

const viewportUserAgents = {
    'ipad': 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A406 Safari/8536.25',
    'iphone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
    'samsung': 'Mozilla/5.0 (Linux; Android 12; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'macbook': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
}

const getHeadersWithUserAgent = (viewport: VisregViewport, headers: Headers) => {
    if (headers['User-Agent']) {
        return headers;
    }

    if (Array.isArray(viewport)) {
        return headers;
    }

    const viewportUserAgent = Object
        .keys(viewportUserAgents)
        .find((key) => viewport.includes(key)) as keyof typeof viewportUserAgents;

    if (!viewportUserAgent) {
        return headers;
    }

    return {
        ...headers,
        'User-Agent': viewportUserAgents[viewportUserAgent],
    }
}

Cypress.Commands.add('prepareForCapture', (props: PrepareForCaptureSettings) => {
    const { fullUrl, viewport, onPageVisitFunctions, fullPageCapture, context, visitSettings, requestSettings } = props;

    if (Cypress.browser.name !== 'firefox') {
        // This is not supported in firefox (will always be 1)
        cy.setDevicePixelRatio(visitSettings.devicePixelRatio || 1);
    }

    const visitOptions = {
        failOnStatusCode: visitSettings.failOnStatusCode ?? true,
        headers: getHeadersWithUserAgent(viewport, requestSettings?.headers || {}),
        auth: requestSettings?.auth,
    }

    cy.setResolution(viewport);

    cy.visit(fullUrl, visitOptions);

    cy.get("html, body").invoke( // potentially alleviates some issues with scroll behavior
        "attr",
        "style",
        "height: auto; scroll-behavior: auto;"
    );

    onPageVisitFunctions?.forEach((fn) => fn && fn(cy, context));
    
    const scrollSettings = {
        duration: visitSettings.scrollDuration || 750,
        ensureScrollable: false,
    }

    if (fullPageCapture) {
        cy.scrollTo('bottom', scrollSettings);
        cy.scrollTo('top', scrollSettings);
        if (visitSettings.waitForNetworkIdle) {
            cy.waitForNetworkIdle(2000, { log: false })
        }
        return;
    }     

    cy.window().then(win => {
        // We scroll a little even if capture is set to viewport, to trigger any lazy loading/interscetion observer.
        cy.scrollTo(0, win.innerHeight, scrollSettings);
        cy.scrollTo('top', scrollSettings);
        if (visitSettings.waitForNetworkIdle) {
            cy.waitForNetworkIdle(2000, { log: false })
        }
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
