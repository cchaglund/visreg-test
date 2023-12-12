# Visual regression testing suite

A universal visual regression testing tool which is quick and easy to set up with a simple and convenient UI to run and assess visual regression.

Built upon [cypress](https://www.cypress.io/), [local-cypress](https://www.npmjs.com/package/local-cypress), and [cypress-image-snapshot](https://github.com/simonsmith/cypress-image-snapshot).


## Setup

- Run `npm install visreg-test` in your project to install the package.
- Create a new directory - this will be your first test suite, where you will configure the tests and store the snapshots.
- In it, create a file with the name `snap.cy.js` and copy the following code into it:

```javascript
import { runTest } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const viewports = [
    'iphone-6',
];

const endpoints = [
    {
        title: 'Start',
        path: '/',
    },
    {
        title: 'Guides',
        path: '/en-US/docs/Learn',
    }
];

runTest({
    baseUrl,
    endpoints,
    viewports,
});
```

So now your directory should look like the following:
    
```

my-project
├── node_modules
├── package.json
├── package-lock.json
└── test-suite
   └── snaps.cy.js

```

And after running the tests, it will look like this:

```

my-project
├── node_modules
├── package.json
├── package-lock.json
└── test-suite
   └── snaps.cy.js
   └── snapshots
      └── snaps
         └── Start @ iphone-6.base.png
         └── Guides @ iphone-6.base.png


```

**In theory this is all you need**, however in practice you will probably want to hook into some functions and/or add some configuration options.

Expanding on the example above, you could add the following to your `snaps.cy.js` file (comments explain the new stuff):

```javascript
import { runTest } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const viewports = [...];

const endpoints = [
    {
        title: 'Start',
        path: '/',
        // Blackout elements from the snapshot, useful for elements that change frequently and are not relevant to the test.
        blackout: ['#sidebar', '.my-selector', 'footer', ...] 
    },
    ...
];

// This is only used when displaying the test results in the terminal.
const suiteName = 'MDN';

// Apply some formatting to the url before a snapshot is taken, e.g. to add query params to the url.
const formatUrl: FormatUrl = (path) => {
    return `${baseUrl}${path}?noexternal`;
}

// Code here will run when cypress has loaded the page but before it starts taking snapshots. Useful to prepare the page, e.g. by clicking to bypass cookie banners or hiding certain elements.
const onPageVisit: OnPageVisit = () => {
    cy.get('header').invoke('css', 'opacity', 0);
    cy.get('body').invoke('css', 'height', 'auto');
}

runTest({
    baseUrl,
    endpoints,
    viewports,
    // Don't forget to add the new options here!
    suiteName,
    formatUrl,
    onPageVisit,
});
```

To create another test suite, simply create a new directory and add a `snap.cy.js` file to it. You can then run the tests for that suite by running `npx visreg-test` from the root of your project and selecting the suite from the list.

You can also add a `visreg.config.js` file to the root of your project to set default values for these options.

### Configuration

`visreg.config.js` is a file that can be added to the root of your project to set some default values.

```json

{
    "testDirectory": "path/to/tests", // Relative or absolute path to directory of test suites. Default is the root of the project, where package.json is.
    "ignoreDirectories": [ // These will not be included in the selection of test suites. node_modules is always ignored
        "path/to/ignored/directory",
        "path/to/another/ignored/directory",
    ]
}

```



## Running the tests

- Run `npx visreg-test` from your project to run the tests.
- If you only have one directory in your test directory, it will be selected automatically, and if you have multiple directories, you will be prompted to select one.
- You will then be prompted to select a test type to run.
- Cypress run run the tests and at the end visreg will open a preview of (any) diffing snapshots and prompt you to accept or reject them as the new baseline.


There are 3 **types** of test:

- **Full suite:** run all the tests and generate a new baseline
- **Retest diffs:** run only the tests which failed in the last run
- **Assess diffs**: assess the existing diffs (no tests are run)



## Notes
- Does not work on Windows.


## Development

### Setup dev environment

- Clone this repo and run `npm install` to install the dependencies, e.g. into a directory called `visreg/repo`.
- Create a directory for testing the module elsewhere (e.g. `visreg/dev-testing-grounds`) and set up the tests according to the instructions above.
- After installing the npm visreg-test package you should now have a `visreg/dev-testing-grounds/node_modules/visreg-test/dist` directory. Delete it.
- From `visreg/repo` run `npm run create-symlink -- [Absolute path]` where the absolute path should be your newly created testing directory (i.e. using the examples above it should be something like `npm run create-symlink -- /Users/.../dev-testing-grounds`). Please note that the path should not end with a slash, because we append some stuff to it.
- This will create a symlink between the `dist` directory in the repo and the `node_modules/visreg-test` directory in your testing directory.

### Running dev mode

- From `visreg/repo` run `npm run watch` to start watching the files and compiling them to the `dist` directory, which will be mirrored to your testing directory. Any changes you make will automatically be reflected in your testing directory visreg-test package, allowing you to test your changes to the package in real time without having to publish and reinstall it all of the time.
- From your testing directory, run the tests. Normally you would use `npx visreg-test` to do so, but due to the symlinking npx doesn't work, so you need to explicityly run it like so, instead: `node ./node_modules/.bin/visreg-test`.
- You should now see the changes you made to the package reflected in the tests.

<!-- 
```javascript
export interface MatchImageSnapshotOptions {
    /**
     * If set to true, the build will not fail when the screenshots to compare have different sizes.
     * @default false
     */
    allowSizeMismatch?: boolean | undefined;
    /**
     * Custom config passed to 'pixelmatch' or 'ssim'
     */
    customDiffConfig?: PixelmatchOptions | Partial<SSIMOptions> | undefined;
    /**
     * The method by which images are compared.
     * `pixelmatch` does a pixel by pixel comparison, whereas `ssim` does a structural similarity comparison.
     * @default 'pixelmatch'
     */
    comparisonMethod?: "pixelmatch" | "ssim" | undefined;
    /**
     * Custom snapshots directory.
     * Absolute path of a directory to keep the snapshot in.
     */
    customSnapshotsDir?: string | undefined;
    /**
     * A custom absolute path of a directory to keep this diff in
     */
    customDiffDir?: string | undefined;
    /**
     * Store the received images separately from the composed diff images on failure.
     * This can be useful when updating baseline images from CI.
     * @default false
     */
    storeReceivedOnFailure?: boolean | undefined;
    /**
     * A custom absolute path of a directory to keep this received image in.
     */
    customReceivedDir?: string | undefined;
    /**
     * A custom postfix which is added to the snapshot name of the received image
     * @default '-received'
     */
    customReceivedPostfix?: string | undefined;
    /**
     * A custom name to give this snapshot. If not provided, one is computed automatically. When a function is provided
     * it is called with an object containing testPath, currentTestName, counter and defaultIdentifier as its first
     * argument. The function must return an identifier to use for the snapshot.
     */
    customSnapshotIdentifier?:
        | ((parameters: {
            testPath: string;
            currentTestName: string;
            counter: number;
            defaultIdentifier: string;
        }) => string)
        | string
        | undefined;
    /**
     * Changes diff image layout direction.
     * @default 'horizontal'
     */
    diffDirection?: "horizontal" | "vertical" | undefined;
    /**
     * Either only include the difference between the baseline and the received image in the diff image, or include
     * the 3 images (following the direction set by `diffDirection`).
     * @default false
     */
    onlyDiff?: boolean | undefined;
    /**
     * This needs to be set to a existing file, like `require.resolve('./runtimeHooksPath.cjs')`.
     * This file can expose a few hooks:
     * - `onBeforeWriteToDisc`: before saving any image to the disc, this function will be called (can be used to write EXIF data to images for instance)
     * - `onBeforeWriteToDisc: (arguments: { buffer: Buffer; destination: string; testPath: string; currentTestName: string }) => Buffer`
     */
    runtimeHooksPath?: string | undefined;
    /**
     * Will output base64 string of a diff image to console in case of failed tests (in addition to creating a diff image).
     * This string can be copy-pasted to a browser address string to preview the diff for a failed test.
     * @default false
     */
    dumpDiffToConsole?: boolean | undefined;
    /**
     * Will output the image to the terminal using iTerm's Inline Images Protocol.
     * If the term is not compatible, it does the same thing as `dumpDiffToConsole`.
     * @default false
     */
    dumpInlineDiffToConsole?: boolean | undefined;
    /**
     * Removes coloring from the console output, useful if storing the results to a file.
     * @default false.
     */
    noColors?: boolean | undefined;
    /**
     * Sets the threshold that would trigger a test failure based on the failureThresholdType selected. This is different
     * to the customDiffConfig.threshold above - the customDiffConfig.threshold is the per pixel failure threshold, whereas
     * this is the failure threshold for the entire comparison.
     * @default 0.
     */
    failureThreshold?: number | undefined;
    /**
     * Sets the type of threshold that would trigger a failure.
     * @default 'pixel'.
     */
    failureThresholdType?: "pixel" | "percent" | undefined;
    /**
     * Updates a snapshot even if it passed the threshold against the existing one.
     * @default false.
     */
    updatePassedSnapshot?: boolean | undefined;
    /**
     * Applies Gaussian Blur on compared images, accepts radius in pixels as value. Useful when you have noise after
     * scaling images per different resolutions on your target website, usually setting its value to 1-2 should be
     * enough to solve that problem.
     * @default 0.
     */
    blur?: number | undefined;
    /**
     * Runs the diff in process without spawning a child process.
     * @default false.
     */
    runInProcess?: boolean | undefined;


    blackout: string[]
    capture: 'runner' | 'viewport' | 'fullPage'
    clip: Dimensions
    disableTimersAndAnimations: boolean
    padding: Padding
    scale: boolean
    overwrite: boolean
    onBeforeScreenshot: ($el: JQuery) => void
    onAfterScreenshot: ($el: JQuery, props: {
      path: string
      size: number
      dimensions: {
        width: number
        height: number
      }
      multipart: boolean
      pixelRatio: number
      takenAt: string
      name: string
      blackout: string[]
      duration: number
      testAttemptIndex: number
    }) => void
}



  interface ResolvedConfigOptions<ComponentDevServerOpts = any> {
    /**
     * Url used as prefix for [cy.visit()](https://on.cypress.io/visit) or [cy.request()](https://on.cypress.io/request) command's url
     * @default null
     */
    baseUrl: string | null
    /**
     * Any values to be set as [environment variables](https://docs.cypress.io/guides/guides/environment-variables.html)
     * @default {}
     */
    env: { [key: string]: any }
    /**
     * A String or Array of glob patterns used to ignore test files that would otherwise be shown in your list of tests. Cypress uses minimatch with the options: {dot: true, matchBase: true}. We suggest using a tool to test what files would match.
     * @default "*.hot-update.js"
     */
    excludeSpecPattern: string | string[]
    /**
     * The number of tests for which snapshots and command data are kept in memory. Reduce this number if you are experiencing high memory consumption in your browser during a test run.
     * @default 50
     */
    numTestsKeptInMemory: number
    /**
     * Port used to host Cypress. Normally this is a randomly generated port
     * @default null
     */
    port: number | null
    /**
     * The [reporter](https://docs.cypress.io/guides/guides/reporters.html) used when running headlessly or in CI
     * @default "spec"
     */
    reporter: string
    /**
     * Some reporters accept [reporterOptions](https://on.cypress.io/reporters) that customize their behavior
     * @default "spec"
     */
    reporterOptions: { [key: string]: any }
    /**
     * Slow test threshold in milliseconds. Only affects the visual output of some reporters. For example, the spec reporter will display the test time in yellow if over the threshold.
     * @default 10000
     */
    slowTestThreshold: number
    /**
     * Whether Cypress will watch and restart tests on test file changes
     * @default true
     */
    watchForFileChanges: boolean
    /**
     * Time, in milliseconds, to wait until most DOM based commands are considered timed out
     * @default 4000
     */
    defaultCommandTimeout: number
    /**
     * Time, in milliseconds, to wait for a system command to finish executing during a [cy.exec()](https://on.cypress.io/exec) command
     * @default 60000
     */
    execTimeout: number
    /**
     * Time, in milliseconds, to wait for page transition events or [cy.visit()](https://on.cypress.io/visit), [cy.go()](https://on.cypress.io/go), [cy.reload()](https://on.cypress.io/reload) commands to fire their page load events
     * @default 60000
     */
    pageLoadTimeout: number
    /**
     * Whether Cypress will search for and replace
     * obstructive JS code in .js or .html files.
     *
     * @see https://on.cypress.io/configuration#modifyObstructiveCode
     */
    modifyObstructiveCode: boolean
    /**
     * Time, in milliseconds, to wait for an XHR request to go out in a [cy.wait()](https://on.cypress.io/wait) command
     * @default 5000
     */
    requestTimeout: number
    /**
     * Time, in milliseconds, to wait until a response in a [cy.request()](https://on.cypress.io/request), [cy.wait()](https://on.cypress.io/wait), [cy.fixture()](https://on.cypress.io/fixture), [cy.getCookie()](https://on.cypress.io/getcookie), [cy.getCookies()](https://on.cypress.io/getcookies), [cy.setCookie()](https://on.cypress.io/setcookie), [cy.clearCookie()](https://on.cypress.io/clearcookie), [cy.clearCookies()](https://on.cypress.io/clearcookies), and [cy.screenshot()](https://on.cypress.io/screenshot) commands
     * @default 30000
     */
    responseTimeout: number
    /**
     * Time, in milliseconds, to wait for a task to finish executing during a cy.task() command
     * @default 60000
     */
    taskTimeout: number
    /**
     * Path to folder where application files will attempt to be served from
     * @default root project folder
     */
    fileServerFolder: string
    /**
     * Path to folder containing fixture files (Pass false to disable)
     * @default "cypress/fixtures"
     */
    fixturesFolder: string | false
    /**
     * Path to folder where files downloaded during a test are saved
     * @default "cypress/downloads"
     */
    downloadsFolder: string
    /**
     * The application under test cannot redirect more than this limit.
     * @default 20
     */
    redirectionLimit: number
    /**
     * If a `node` executable is found, this will be the full filesystem path to that executable.
     * @default null
     */
    resolvedNodePath: string
    /**
     * The version of `node` that is being used to execute plugins.
     * @example 1.2.3
     */
    resolvedNodeVersion: string
    /**
     * Whether Cypress will take a screenshot when a test fails during cypress run.
     * @default true
     */
    screenshotOnRunFailure: boolean
    /**
     * Path to folder where screenshots will be saved from [cy.screenshot()](https://on.cypress.io/screenshot) command or after a headless or CI run's test failure
     * @default "cypress/screenshots"
     */
    screenshotsFolder: string | false
    /**
     * Path to file to load before test files load. This file is compiled and bundled. (Pass false to disable)
     * @default "cypress/support/{e2e|component}.js"
     */
    supportFile: string | false
    /**
     * The test isolation ensures a clean browser context between tests.
     *
     * Cypress will always reset/clear aliases, intercepts, clock, and viewport before each test
     * to ensure a clean test slate; i.e. this configuration only impacts the browser context.
     *
     * Note: the [`cy.session()`](https://on.cypress.io/session) command will inherent this value to determine whether
     * or not the page is cleared when the command executes. This command is only available in end-to-end testing.
     *
     *  - true - The page is cleared before each test. Cookies, local storage and session storage in all domains are cleared
     *         before each test. The `cy.session()` command will also clear the page and current browser context when creating
     *         or restoring the browser session.
     *  - false - The current browser state will persist between tests. The page does not clear before the test and cookies, local
     *          storage and session storage will be available in the next test. The `cy.session()` command will only clear the
     *          current browser context when creating or restoring the browser session - the current page will not clear.
     *
     * Tradeoffs:
     *      Turning test isolation off may improve performance of end-to-end tests, however, previous tests could impact the
     *      browser state of the next test and cause inconsistency when using .only(). Be mindful to write isolated tests when
     *      test isolation is false. If a test in the suite impacts the state of other tests and it were to fail, you could see
     *      misleading errors in later tests which makes debugging clunky. See the [documentation](https://on.cypress.io/test-isolation)
     *      for more information.
     *
     * @default true
     */
    testIsolation: boolean
    /**
     * Path to folder where videos will be saved after a headless or CI run
     * @default "cypress/videos"
     */
    videosFolder: string
    /**
     * Whether Cypress will trash assets within the screenshotsFolder and videosFolder before headless test runs.
     * @default true
     */
    trashAssetsBeforeRuns: boolean
    /**
     * The quality setting for the video compression, in Constant Rate Factor (CRF).
     * Enable compression by passing true to use the default CRF of 32.
     * Compress at custom CRF by passing a number between 1 and 51, where a lower value results in better quality (at the expense of a higher file size).
     * Disable compression by passing false or 0.
     * @default 32
     */
    videoCompression: number | boolean
    /**
     * Whether Cypress will record a video of the test run when executing in run mode.
     * @default false
     */
    video: boolean
    /**
     * Whether Chrome Web Security for same-origin policy and insecure mixed content is enabled. Read more about this here
     * @default true
     */
    chromeWebSecurity: boolean
    /**
     * Default height in pixels for the application under tests' viewport (Override with [cy.viewport()](https://on.cypress.io/viewport) command)
     * @default 660
     */
    viewportHeight: number
    /**
     * Default width in pixels for the application under tests' viewport. (Override with [cy.viewport()](https://on.cypress.io/viewport) command)
     * @default 1000
     */
    viewportWidth: number
    /**
     * The distance in pixels an element must exceed over time to be considered animating
     * @default 5
     */
    animationDistanceThreshold: number
    /**
     * Whether to wait for elements to finish animating before executing commands
     * @default true
     */
    waitForAnimations: boolean
    /**
     * Viewport position to which an element should be scrolled prior to action commands. Setting `false` disables scrolling.
     * @default 'top'
     */
    scrollBehavior: scrollBehaviorOptions
    /**
     * Indicates whether Cypress should allow CSP header directives from the application under test.
     * - When this option is set to `false`, Cypress will strip the entire CSP header.
     * - When this option is set to `true`, Cypress will only to strip directives that would interfere
     * with or inhibit Cypress functionality.
     * - When this option to an array of allowable directives (`[ 'default-src', ... ]`), the directives
     * specified will remain in the response headers.
     *
     * Please see the documentation for more information.
     * @see https://on.cypress.io/experiments#Experimental-CSP-Allow-List
     * @default false
     */
    experimentalCspAllowList: boolean | experimentalCspAllowedDirectives[],
    /**
     * Allows listening to the `before:run`, `after:run`, `before:spec`, and `after:spec` events in the plugins file during interactive mode.
     * @default false
     */
    experimentalInteractiveRunEvents: boolean
    /**
     * Whether Cypress will search for and replace obstructive code in third party .js or .html files.
     * NOTE: Setting this flag to true removes Subresource Integrity (SRI).
     * Please see https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity.
     * This option has no impact on experimentalSourceRewriting and is only used with the
     * non-experimental source rewriter.
     * @see https://on.cypress.io/experiments#Configuration
     */
    experimentalModifyObstructiveThirdPartyCode: boolean
    /**
     * Disables setting document.domain to the applications super domain on injection.
     * This experiment is to be used for sites that do not work with setting document.domain
     * due to cross-origin issues. Enabling this option no longer allows for default subdomain
     * navigations, and will require the use of cy.origin(). This option takes an array of
     * strings/string globs.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/domain
     * @see https://on.cypress.io/experiments#Experimental-Skip-Domain-Injection
     * @default null
     */
    experimentalSkipDomainInjection: string[] | null
    /**
     * Enables AST-based JS/HTML rewriting. This may fix issues caused by the existing regex-based JS/HTML replacement algorithm.
     * @default false
     */
    experimentalSourceRewriting: boolean
    /**
     * Generate and save commands directly to your test suite by interacting with your app as an end user would.
     * @default false
     */
    experimentalStudio: boolean
    /**
     * Adds support for testing in the WebKit browser engine used by Safari. See https://on.cypress.io/webkit-experiment for more information.
     * @default false
     */
    experimentalWebKitSupport: boolean
    /**
     * Enables support for improved memory management within Chromium-based browsers.
     * @default false
     */
    experimentalMemoryManagement: boolean
    /**
     * Number of times to retry a failed test.
     * If a number is set, tests will retry in both runMode and openMode.
     * To enable test retries only in runMode, set e.g. `{ openMode: null, runMode: 2 }`
     * @default null
     */
    retries: Nullable<number | ({ runMode?: Nullable<number>, openMode?: Nullable<number> }) | RetryStrategyWithModeSpecs>
    /**
     * Enables including elements within the shadow DOM when using querying
     * commands (e.g. cy.get(), cy.find()). Can be set globally in cypress.config.{js,ts,mjs,cjs},
     * per-suite or per-test in the test configuration object, or programmatically
     * with Cypress.config()
     * @default false
     */
    includeShadowDom: boolean

    /**
     * The list of hosts to be blocked
     */
    blockHosts: null | string | string[]
    /**
     * A unique ID for the project used for recording
     */
    projectId: null | string
    /**
     * Path to the support folder.
     */
    supportFolder: string
    /**
     * Glob pattern to determine what test files to load.
     */
    specPattern: string | string[]
    /**
     * The user agent the browser sends in all request headers.
     */
    userAgent: null | string
    /**
     * Polyfills `window.fetch`` to enable Network spying and stubbing
     */
    experimentalFetchPolyfill: boolean

    /**
     * Override default config options for Component Testing runner.
     * @default {}
     */
    component: ComponentConfigOptions<ComponentDevServerOpts>

    /**
     * Override default config options for E2E Testing runner.
     * @default {}
     */
    e2e: EndToEndConfigOptions

    /**
     * An array of objects defining the certificates
     */
    clientCertificates: ClientCertificate[]

    /**
     * Handle Cypress plugins
     */
    setupNodeEvents: (on: PluginEvents, config: PluginConfigOptions) => Promise<PluginConfigOptions | void> | PluginConfigOptions | void

    indexHtmlFile: string
  }
```` -->