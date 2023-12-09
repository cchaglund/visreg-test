/// <reference types="cypress" />
/// <reference types="cypress" />
/// <reference types="cypress" />
import './commands';
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to set the viewport to a specific device preset or [width, height].
             * @example cy.setResolution('samsung-s10')
             */
            setResolution(value: ViewportPreset | number[]): Chainable<JQuery<HTMLElement>>;
            /**
             * Custom command to capture the full page
             * @example cy.prepareForCapture('/home', 'samsung-s10')
             */
            prepareForCapture(fullUrl: string, size: ViewportConfig, onPageVisit?: () => void): Chainable<JQuery<HTMLElement>>;
        }
        type Endpoints = {
            title: string;
            path: string;
            blackout?: string[];
        };
        type SnapConfig = {
            path: string;
            size: ViewportPreset | number[];
            title: string;
        };
        type ViewportConfig = ViewportPreset | number[];
    }
}
