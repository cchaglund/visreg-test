/**
 * @description
 * This file is used to define the endpoints that will be tested.
 * 
 * @example
 * export const endpoints: Cypress.Endpoints = {
 *    'My page title': {
 *       path: '/path-to-page',
 *      blackout: ['.selector-to-blackout', '#another-selector-to-blackout']
 *   }
 */
export const endpoints: Cypress.Endpoints = {
    'Cypress': {
        path: '/guides/overview/why-cypress',
        blackout: []
    },
    'Core Concepts': {
        path: '/guides/core-concepts/introduction-to-cypress',
        blackout: []
    },
}
