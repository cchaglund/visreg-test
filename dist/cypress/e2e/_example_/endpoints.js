"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description
 * This file is used to define the endpoints that will be tested.
 *
 * @example
 * export const endpoints: Cypress.Endpoints = [
 *    {
 *       title: 'My page title',
 *       path: '/path-to-page',
 *       blackout: ['.selector-to-blackout', '#another-selector-to-blackout']
 *   ]
 */
const endpoints = [
    {
        title: 'Cypress',
        path: '/guides/overview/why-cypress',
        blackout: ['#sidebar']
    },
    {
        title: 'Core Concepts',
        path: '/guides/core-concepts/introduction-to-cypress',
    }
];
exports.default = endpoints;
