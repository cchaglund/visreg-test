const parseSnapConfigFromName = (name: string, pages: Cypress.Endpoints[]): Cypress.SnapConfig | null => {
    const divider = ' @ ';
    const nameParts = name.split(divider);
    
    const title = nameParts[0];
    const sizeRaw = nameParts[1].replace('.diff.png', '') as Cypress.ViewportPreset;

    let size: Cypress.ViewportConfig = sizeRaw;
    if (sizeRaw.includes(',')) {
        size = sizeRaw.split(',').map(dimension => parseInt(dimension));
    }
    
    const page = pages.find(page => page.title === title);

    if (!page) {
        return null;
    }

    return {
        path: page.path,
        size,
        title,
    };    
};


type TestProps = {
    suiteName: string;
    endpoints: Cypress.Endpoints[];
    viewports: Cypress.ViewportConfig[];
    formatUrl: (path: string) => string;
    onPageVisit: () => void;
    diffs: string[];
};

export const runTest = (props: TestProps): void => {
    const { suiteName, endpoints, viewports, formatUrl, onPageVisit, diffs } = props;

    describe(`Visual regression (${suiteName})`, () => {

        if (Cypress.env('test-all')) {
            describe('Full visual regression test', () => {
                viewports.forEach((size) => {
                    endpoints.forEach((endpoint) => {
                        const { path, title, blackout } = endpoint;
                
                        const snapName = `${title} @ ${size}`;
                        const fullUrl = formatUrl(path);
                
                        it(snapName, () => {
                            cy.prepareForCapture(fullUrl, size, onPageVisit);
                
                            cy.matchImageSnapshot( snapName, {
                                storeReceivedOnFailure: true,
                                blackout,
                            });
                        });
                    });
                });
            });
        }
        
        
        if (Cypress.env('retest-diffs-only')) {
            describe('Retesting diffing snapshots only', () => {
                diffs.forEach(diffSnapName => {
                    const { path, size, title }: Cypress.SnapConfig = parseSnapConfigFromName(diffSnapName, endpoints)
        
                    const endpoint = endpoints.find(endpoint => endpoint.title === title);
                    const snapName = `${title} @ ${size}`;
                    const blackout = endpoint.blackout;
                    const fullUrl = formatUrl(path);
        
                    it(snapName, () => {
                        cy.prepareForCapture(fullUrl, size, onPageVisit);
        
                        cy.matchImageSnapshot(snapName, {
                            snapFilenameExtension: '.base',
                            storeReceivedOnFailure: true,
                            blackout,
                        });
                    });
                });
            });
        }
    });
}
