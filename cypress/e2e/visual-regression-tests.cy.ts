import { delimiter } from '../../shared';

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

const defaultViewports: Cypress.ViewportConfig[] = [
    'iphone-6',
    'ipad-2',
    [1920, 1080],
];

type TestProps = {
    suiteName: string;
    baseUrl: string;
    endpoints: Cypress.Endpoints[];
    viewports?: Cypress.ViewportConfig[];
    formatUrl?: (path: string) => string;
    onPageVisit?: () => void;
};

export const runTest = (props: TestProps): void => {
    const { suiteName, baseUrl, endpoints, viewports, formatUrl, onPageVisit } = props;

    const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');
    const views = viewports ? viewports : defaultViewports;

    describe(`Visual regression ${suiteName && '- ' + suiteName}`, () => {

        if (Cypress.env('testType') === 'test-all') {
            describe('Full visual regression test', () => {
                views.forEach((size) => {
                    endpoints.forEach((endpoint) => {
                        const { path, title, blackout } = endpoint;
                
                        const snapName = `${title} @ ${size}`;
                        const fullUrl = formatUrl ? formatUrl(path) : `${sanitizedBaseUrl}${path}`;
                
                        it(snapName, () => {
                            cy.prepareForCapture(fullUrl, size, onPageVisit);
                
                            cy.matchImageSnapshot( snapName, {
                                storeReceivedOnFailure: true,
                                blackout: blackout ? blackout : [],
                            });
                        });
                    });
                });
            });
        }
        
        
        if (Cypress.env('testType') === 'retest-diffs-only') {
            describe('Retesting diffing snapshots only', () => {
                if(!Cypress.env('diffListString')) {
                    return;
                }

                const decodedString = Buffer.from(Cypress.env('diffListString'), 'base64').toString('utf8');
                const diffs = decodedString.split(delimiter);

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
                            blackout: blackout ? blackout : [],
                        });
                    });
                });
            });
        }
    });
}
