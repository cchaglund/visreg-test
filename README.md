# About

A universal visual regression testing tool which is quick and easy to set up with a simple and convenient UI to run and assess visual regression.

Built upon [cypress](https://www.cypress.io/), [local-cypress](https://www.npmjs.com/package/local-cypress), and [cypress-image-snapshot](https://github.com/simonsmith/cypress-image-snapshot).

<br>

# Setup

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

const viewports = [
    'iphone-6',
];

const endpoints = [
    {
        title: 'Start',
        path: '/',
        // Blackout elements from the snapshot, useful for elements that change frequently and are not relevant to the test.
        blackout: ['#sidebar', '.my-selector', 'footer'] 
    },
    {
        title: 'Guides',
        path: '/en-US/docs/Learn',
    }
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

You can also add a `visreg.config.js` file to the root of your project to set default values for these options. See [Configuration options](#configuration-options) for more details.


## Running the tests

- Run `npx visreg-test` from your project to run the tests.
- If you only have one directory in your test directory, it will be selected automatically, and if you have multiple directories, you will be prompted to select one.
- You will then be prompted to select a test type to run.
- Cypress run run the tests and at the end visreg will open a preview of (any) diffing snapshots and prompt you to accept or reject them as the new baseline.


There are 3 **types** of test:

- **Full suite:** run all the tests and generate a new baseline
- **Retest diffs:** run only the tests which failed in the last run
- **Assess diffs**: assess the existing diffs (no tests are run)




<br>

# Development

Want to contribute? Great! Here's how to get started:

## Setup dev environment

- Clone this repo and run `npm install` to install the dependencies, e.g. into a directory called `visreg/repo`.
- Create a directory for testing the module elsewhere (e.g. `visreg/dev-testing-grounds`) and set up the tests according to the instructions above.
- After installing the npm visreg-test package you should now have a `visreg/dev-testing-grounds/node_modules/visreg-test/dist` directory. Delete it.
- From `visreg/repo` run `npm run create-symlink -- [Absolute path]` where the absolute path should be your newly created testing directory (i.e. using the examples above it should be something like `npm run create-symlink -- /Users/.../dev-testing-grounds`). Please note that the path should not end with a slash, because we append some stuff to it.
- This will create a symlink between the `dist` directory in the repo and the `node_modules/visreg-test` directory in your testing directory.

## Running dev mode

- From `visreg/repo` run `npm run dev` to start watching the files and compiling them to the `dist` directory, which will be mirrored to your testing directory. Any changes you make will automatically be reflected in your testing directory visreg-test package, allowing you to test your changes to the package in real time without having to publish and reinstall it all of the time.
- From your testing directory, run the tests. Normally you would use `npx visreg-test` to do so, but due to the symlinking npx doesn't work (you'll get a "permission denied"), so you need to explicityly run it like so, instead: `node ./node_modules/.bin/visreg-test`.
- You should now see the changes you made to the package reflected in the tests.
<!-- 




<br>

# Configuration options

`visreg.config.js` is a file that can be added to the root of your project to set some default values. It is optional, and if it is not present, the default values will be used instead.

```json

{
    /**
	 * Relative or absolute path to directory of test suites. Default is the root of the project,
     * where package.json is.
	 */
    "testDirectory": "path/to/tests",
    /**
    * These will not be included in the selection of test suites. node_modules is always ignored
    */
    "ignoreDirectories": [
        "path/to/ignored/directory",
        "path/to/another/ignored/directory",
    ],
    /**
    * Options to pass to cypress and the jest comparison engine. 
    */
    "screenshotOptions": {...},
    "comparisonOptions": {...}
}

```

Where `screenshotOptions` and `comparisonOptions` are the options that can be passed to Cypress and the Jest comparison engine respectively.

```javascript

interface ConfigurationOptions = {
    testDirectory: string;
    ignoreDirectories: string[];
	screenshotOptions: Partial<CypressScreenshotOptions>;
	comparisonOptions: Partial<JestMatchImageSnapshotOptions>;
};


/**
 * Options to pass to Cypress when taking screenshots.
 * @see https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
 * @see https://docs.cypress.io/api/commands/screenshot#Arguments
 */
interface CypressScreenshotOptions {
	/**
	 * Array of string selectors used to match elements that should be blacked out when the screenshot is taken.
	 * Does not apply to element screenshot captures.
	 * @type {string[]}
	 * @default []
	 */
	blackout: string[];

	/**
	 * Which parts of the Cypress Test Runner to capture.
	 * This value is ignored for element screenshot captures.
	 * Valid values are viewport, fullPage, or runner.
	 * When viewport, the application under test is captured in the current viewport.
	 * When fullPage, the application under test is captured in its entirety from top to bottom.
	 * When runner, the entire browser viewport, including the Cypress Command Log, is captured.
	 * For screenshots automatically taken on test failure, capture is always coerced to runner.
	 * When Test Replay is enabled and the Runner UI is hidden, a runner screenshot will not include the Runner UI
	 * and will instead capture the application under test only in the current viewport.
	 * @type {string}
	 * @default 'fullPage'
	 */
	capture: 'viewport' | 'fullPage' | 'runner';

	/**
	 * When true, prevents JavaScript timers (setTimeout, setInterval, etc) and CSS animations from running
	 * while the screenshot is taken.
	 * @type {boolean}
	 * @default true
	 */
	disableTimersAndAnimations: boolean;

	/**
	 * Position and dimensions (in pixels) used to crop the final screenshot image. 
	 * @type {Object}
	 * @default null
	 * @property {number} x - The x-coordinate of the top-left corner of the cropped image.
	 * @property {number} y - The y-coordinate of the top-left corner of the cropped image.
	 * @property {number} width - The width of the cropped image.
	 * @property {number} height - The height of the cropped image.
	 */
	clip: {
		x: number;
		y: number;
		width: number;
		height: number;
	};

	/**
	 * Padding used to alter the dimensions of a screenshot of an element. 
	 * It can either be a number, or an array of up to four numbers using CSS shorthand notation. 
	 * This property is only applied for element screenshots and is ignored for all other types.
	 * @type {number | [number] | [number, number] | [number, number, number] | [number, number, number, number]}
	 * @default null
	 */
	padding:
		| number
		| [ number ]
		| [ number, number ]
		| [ number, number, number ]
		| [ number, number, number, number ];
	/**
	 * Whether to scale the app to fit into the browser viewport.
	 * This is always coerced to true for runner captures.
	 * @type {boolean}
	 * @default false
	 */
	scale: boolean;

	/**
	 * Time to wait for .screenshot() to resolve before timing out
	 * @type {Object}
	 * @property {number} defaultCommandTimeout - Time, in milliseconds, to wait until most DOM based commands are considered timed out.
	 * @property {number} execTimeout - Time, in milliseconds, to wait for a system command to finish executing during a cy.exec() command.
	 * @property {number} taskTimeout - Time, in milliseconds, to wait for a task to finish executing during a cy.task() command.
	 * @property {number} pageLoadTimeout - Time, in milliseconds, to wait for page transition events or cy.visit(), cy.go(), cy.reload() commands to fire their page load events. Network requests are limited by the underlying operating system, and may still time out if this value is increased.
	 * @property {number} requestTimeout - Time, in milliseconds, to wait for a request to go out in a cy.wait() command.
	 * @property {number} responseTimeout - Time, in milliseconds, to wait until a response in a cy.request(), cy.wait(), cy.fixture(), cy.getCookie(), cy.getCookies(), cy.setCookie(), cy.clearCookie(), cy.clearCookies(), and cy.screenshot() commands.
	 * @see https://docs.cypress.io/guides/references/configuration.html#Timeouts
	 */
	timeout: {
		defaultCommandTimeout: 4000,
		execTimeout: 60000,
		taskTimeout: 60000,
		pageLoadTimeout: 60000,
		requestTimeout: 5000,
		responseTimeout: 30000
	};

	/**
	 * When true, automatically takes a screenshot when there is a failure during cypress run.
	 * @type {boolean}
	 * @default true
	 */
	screenshotOnRunFailure: boolean;

	/**
	 * Whether to overwrite duplicate screenshot files with the same file name when saving.
	 * @type {boolean}
	 * @default false
	 */
	overwrite: boolean;

	/**
	 * A callback before a (non-failure) screenshot is taken.
	 * For an element capture, the argument is the element being captured.
	 * For other screenshots, the argument is the $el.
	 * @type {Function}
	 * @default null
	 * @param {Object} $el - The element being captured.
	 */
	onBeforeScreenshot: Function | null;

	/**
	 * A callback after a (non-failure) screenshot is taken.
	 * For an element capture, the first argument is the element being captured.
	 * For other screenshots, the first argument is the $el.
	 * The second argument is properties concerning the screenshot, including the path it was saved to
	 * and the dimensions of the saved screenshot.
	 * @type {Function}
	 * @default null
	 * @param {Object} $el - The element being captured.
	 * @param {Object} props - Properties concerning the screenshot, including the path it was saved to and the dimensions of the saved screenshot.
	 * @param {string} props.path - The path the screenshot was saved to.
	 * @param {number} props.size - The size of the screenshot in bytes.
	 * @param {Object} props.dimensions - The dimensions of the screenshot.
	 * @param {number} props.dimensions.width - The width of the screenshot.
	 * @param {number} props.dimensions.height - The height of the screenshot.
	 * @param {boolean} props.multipart - Whether the screenshot was saved as a multipart image.
	 * @param {number} props.pixelRatio - The pixel ratio of the screenshot.
	 * @param {string} props.takenAt - The time the screenshot was taken.
	 * @param {string} props.name - The name of the screenshot.
	 * @param {string[]} props.blackout - The selectors used to blackout parts of the screenshot.
	 * @param {number} props.duration - The duration of the screenshot command.
	 * @param {number} props.testAttemptIndex - The index of the test attempt.
	 * @see https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
	 */
	onAfterScreenshot: Function | null;
}


/**
 * Options to pass to the Jest comparison engine when comparing screenshots.
 * @see https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api
 */
interface JestMatchImageSnapshotOptions {
	/**
	 * If set to true, the build will not fail when the screenshots to compare have different sizes.
	 * @type {boolean | undefined}
	 * @default false
	 */
	allowSizeMismatch: boolean | undefined;

	/**
	 * Custom config passed to 'pixelmatch' or 'ssim'
	 */
	customDiffConfig: {
		/**
		 * Matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive.
		 * @default 0.1
		 */
		readonly threshold: number | undefined;

		/**
		 * If true, disables detecting and ignoring anti-aliased pixels.
		 * @default false
		 */
		readonly includeAA: boolean | undefined;

		/**
		 * Blending factor of unchanged pixels in the diff output.
		 * Ranges from 0 for pure white to 1 for original brightness
		 * @default 0.1
		 */
		alpha: number | undefined;

		/**
		 * The color of anti-aliased pixels in the diff output.
		 * @default [255, 255, 0]
		 */
		aaColor: [ number, number, number ] | undefined;

		/**
		 * The color of differing pixels in the diff output.
		 * @default [255, 0, 0]
		 */
		diffColor: [ number, number, number ] | undefined;
		
		/**
		 * An alternative color to use for dark on light differences to differentiate between "added" and "removed" parts.
		 * If not provided, all differing pixels use the color specified by `diffColor`.
		 * @default null
		 */
		diffColorAlt: [ number, number, number ] | undefined;

		/**
		 * Draw the diff over a transparent background (a mask), rather than over the original image.
		 * Will not draw anti-aliased pixels (if detected)
		 * @default false
		 */
		diffMask: boolean | undefined;
	} | Partial<{
		rgb2grayVersion: 'original' | 'integer';
		k1: number;
		k2: number;
		ssim: 'fast' | 'original' | 'bezkrovny' | 'weber';
		windowSize: number;
		bitDepth: number;
		downsample: 'original' | 'fast' | false;
		maxSize: number;
	}> | undefined;

	/**
	 * The method by which images are compared.
	 * `pixelmatch` does a pixel by pixel comparison, whereas `ssim` does a structural similarity comparison.
	 * @default 'pixelmatch'
	 */
	comparisonMethod: "pixelmatch" | "ssim" | undefined;


	/**
	 * A custom name to give this snapshot. If not provided, one is computed automatically. When a function is provided
	 * it is called with an object containing testPath, currentTestName, counter and defaultIdentifier as its first
	 * argument. The function must return an identifier to use for the snapshot.
	 */
	customSnapshotIdentifier:
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
	diffDirection: "horizontal" | "vertical" | undefined;

	/**
	 * Either only include the difference between the baseline and the received image in the diff image, or include
	 * the 3 images (following the direction set by `diffDirection`).
	 * @default false
	 */
	onlyDiff: boolean | undefined;

	/**
	 * This needs to be set to a existing file, like `require.resolve('./runtimeHooksPath.cjs')`.
	 * This file can expose a few hooks:
	 * - `onBeforeWriteToDisc`: before saving any image to the disc, this function will be called (can be used to write EXIF data to images for instance)
	 * - `onBeforeWriteToDisc: (arguments: { buffer: Buffer; destination: string; testPath: string; currentTestName: string }) => Buffer`
	 */
	runtimeHooksPath: string | undefined;

	/**
	 * Will output base64 string of a diff image to console in case of failed tests (in addition to creating a diff image).
	 * This string can be copy-pasted to a browser address string to preview the diff for a failed test.
	 * @default false
	 */
	dumpDiffToConsole: boolean | undefined;

	/**
	 * Will output the image to the terminal using iTerm's Inline Images Protocol.
	 * If the term is not compatible, it does the same thing as `dumpDiffToConsole`.
	 * @default false
	 */
	dumpInlineDiffToConsole: boolean | undefined;

	/**
	 * Removes coloring from the console output, useful if storing the results to a file.
	 * @default false.
	 */
	noColors: boolean | undefined;

	/**
	 * Sets the threshold that would trigger a test failure based on the failureThresholdType selected. This is different
	 * to the customDiffConfig.threshold above - the customDiffConfig.threshold is the per pixel failure threshold, whereas
	 * this is the failure threshold for the entire comparison.
	 * @default 0.
	 */
	failureThreshold: number | undefined;

	/**
	 * Sets the type of threshold that would trigger a failure.
	 * @default 'pixel'.
	 */
	failureThresholdType: "pixel" | "percent" | undefined;

	/**
	 * Updates a snapshot even if it passed the threshold against the existing one.
	 * @default false.
	 */
	updatePassedSnapshot: boolean | undefined;

	/**
	 * Applies Gaussian Blur on compared images, accepts radius in pixels as value. Useful when you have noise after
	 * scaling images per different resolutions on your target website, usually setting its value to 1-2 should be
	 * enough to solve that problem.
	 * @default 0.
	 */
	blur: number | undefined;
}


```

<br>

# Notes
- Does not work on Windows. -->
