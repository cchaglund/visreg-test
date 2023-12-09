"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const local_cypress_1 = require("local-cypress");
local_cypress_1.Cypress.Commands.add('prepareForCapture', (fullUrl, size, onPageVisit) => {
    local_cypress_1.cy.setResolution(size);
    local_cypress_1.cy.visit(fullUrl);
    onPageVisit && onPageVisit();
    local_cypress_1.cy.scrollTo('bottom', { duration: 1000, ensureScrollable: false });
    local_cypress_1.cy.scrollTo('top', { ensureScrollable: false });
});
local_cypress_1.Cypress.Commands.add("setResolution", (size) => {
    if (local_cypress_1.Cypress._.isArray(size)) {
        local_cypress_1.cy.viewport(size[0], size[1]);
    }
    else {
        local_cypress_1.cy.log(JSON.stringify(size == undefined));
        local_cypress_1.cy.viewport(size);
    }
});
