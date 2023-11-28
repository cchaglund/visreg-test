
type TestProps = {
    endpoints: Cypress.Endpoints;
    viewports: Cypress.ViewportConfig[];
    formatUrl: (path: string) => string;
    onPageVisit: () => void;
};

export const runTest = (props: TestProps): void => {
    const { endpoints, viewports, formatUrl, onPageVisit } = props;

    viewports.forEach((size) => {
        Object.keys(endpoints).forEach((key) => {

            const title = key;
            const path = endpoints[key].path;
            const blackout = endpoints[key].blackout;

            it(`Test page '${title}' @ ${size}`, () => {
                const fullUrl = formatUrl(path);

                cy.prepareForCapture(fullUrl, size, onPageVisit);

                cy.matchImageSnapshot(`'${title}' @ ${size}`, {
                    storeReceivedOnFailure: true,
                    blackout,
                });
            });
        });
    });
}

type DiffingTestProps = {
    endpoints: Cypress.Endpoints;
    formatUrl: (path: string) => string;
    onPageVisit: () => void;
    diffs: string[];
};

export const runDiffingTest = (props: DiffingTestProps): void => {
    const { endpoints, formatUrl, onPageVisit, diffs } = props;

    diffs.forEach(diffSnapName => {
        const snapConfig: Cypress.SnapConfig = parseSnapConfigFromName(diffSnapName, endpoints)

        if (!snapConfig) {
            return;
        }

        const { path, size, title } = snapConfig;
        const endpoint = endpoints[title];
        const blackout = endpoint.blackout;

        it('Test only diffing pages', () => {
            const fullUrl = formatUrl(path);
            cy.prepareForCapture(fullUrl, size, onPageVisit);

            cy.matchImageSnapshot(`'${title}' @ ${size}`, {
                snapFilenameExtension: '.snap',
                storeReceivedOnFailure: true,
                blackout,
            });
        });
    });
}    

export const parseSnapConfigFromName = (name: string, pages: Cypress.Endpoints): Cypress.SnapConfig | null => {
    let titleMatch = name.match(/'([^']*)'/);
    const title = titleMatch ? titleMatch[ 1 ] : '';

    const deviceOrDimensionsStringMatch = name.match(/@ (.*)\.diff/); // match anything after "@ " and before ".snap"
    const deviceOrDimensionString = deviceOrDimensionsStringMatch ? deviceOrDimensionsStringMatch[ 1 ] : '';

    const isDeviceString = !deviceOrDimensionString.includes(',');
    const viewportPreset = isDeviceString && deviceOrDimensionString as Cypress.ViewportPreset;
    const dimensionArray = !isDeviceString && deviceOrDimensionString.split(',').map(dimension => parseInt(dimension));

    const page = pages[title];

    if (!page) {
        return null;
    }

    return {
        path: page.path,
        size: viewportPreset || dimensionArray,
        title,
    };    
};


