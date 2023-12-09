type TestProps = {
    suiteName: string;
    baseUrl: string;
    endpoints: Cypress.Endpoints[];
    viewports?: Cypress.ViewportConfig[];
    formatUrl?: (path: string) => string;
    onPageVisit?: () => void;
};
export declare const runTest: (props: TestProps) => void;
export {};
