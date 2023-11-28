export const endpoints: Cypress.Endpoints = {
    'My page title': {
        path: '/path-to-page',
        blackout: ['.selector-to-blackout', '#another-selector-to-blackout']
    },
}
