# About

A visual regression testing solution that offers an easy setup with simple yet powerful customisation options, wrapped up in a convenient CLI runner to make assessing and accepting/rejecting diffs a breeze.

Built upon [cypress](https://www.cypress.io/), [local-cypress](https://www.npmjs.com/package/local-cypress), and [cypress-image-snapshot](https://github.com/simonsmith/cypress-image-snapshot).


<br>

# Setup

Let's install the package and create our first test suite - a directory containing a test configuration file and any generated snapshots.

- Run `npm install visreg-test` in your project to install the package.
- Create a new directory - this will be your first test suite, where you will configure the tests and store the snapshots.
- In it, create a test configuration javascript file with the name `snaps.cy.js` and copy the below code into it.

> Note: you can also use Typescript, so where you see `snaps.cy.js` you can  use `snaps.cy.ts` instead. You don't need to compile the file into javascript, the module does that for you automatically at runtime.

<details open>
<summary>JavaScript</summary>

```javascript
// JavaScript
import { run } from 'visreg-test';

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

run({
    baseUrl,
    endpoints,
    viewports,
});
```
</details>

<details>
<summary>Typescript</summary>

```typescript
// Typescript
import { run, VisregViewport, Endpoint, TestProps } from 'visreg-test';

const baseUrl: string = 'https://developer.mozilla.org';

const viewports: VisregViewport[] = [
    'iphone-6',
];

const endpoints: Endpoint[] = [
    {
        title: 'Start',
        path: '/',
    },
    {
        title: 'Guides',
        path: '/en-US/docs/Learn',
    }
];

const options: TestProps = {
    baseUrl,
    endpoints,
    viewports,
};

run(options);

```

</details>
<br>



So now your directory should look something like the following:
    
```

my-project
├── node_modules
├── package.json
├── package-lock.json
└── test-suite
   └── snaps.cy.js

```



In *theory* this is all you need and you can [run your first test](#running-the-tests).

However, in *practice* you will probably want to hook into some functions and/or add some configuration options, e.g. to get rid of cookie banners or hide certain elements before taking the snapshots.

## Setup+ (optional)

Expanding on the example above, you could add the following to your `snaps.cy` file (comments explain the new stuff):

<details open>
<summary>JavaScript</summary>

```javascript
// snaps.cy.js
import { run } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const viewports = [
    'iphone-6',
];

const endpoints = [
    {
        title: 'Start',
        path: '/',
        /**
         * Blackout elements from the snapshot, useful for elements that change frequently and are not relevant to the test.
         */
        blackout: ['#sidebar', '.my-selector', 'footer'],
        /**
         * Capture a screenshot of a specific element on the page, rather than the whole page.
         */
        elementToMatch: ['div[data-testid="my-element"]'],
        /**
         * Padding to add to the element screenshot. Ignored if elementToMatch is not set.
         */
        padding: [20, 40],
        /**
         * Valid values are viewport or fullPage.
         * Whether to capture the viewport or the whole page.
         * This value is ignored for element screenshot captures.
         */
        capture: 'viewport',
        /**
         * Place to do manipulate the page specified in the endpoint before taking the snapshot.
         */
        onEndpointVisit: () => {
            cy.get('button[id="expand-section"]').click();
        },
    },
    {
        title: 'Guides',
        path: '/en-US/docs/Learn',
    }
];

/**
 * This is only used when displaying the test results in the terminal.
 */
const suiteName = 'MDN';

/**
 * Apply some formatting to the url before a snapshot is taken, e.g. to add query params to the url.
 */
const formatUrl = (path) => {
    return `${baseUrl}${path}?noexternal`;
}

/**
 * Code here will run when cypress has loaded the page but before it starts taking snapshots. Useful to prepare the page, e.g. by clicking to bypass cookie banners or hiding certain elements.
 */
const onPageVisit = () => {
    cy.get('header').invoke('css', 'opacity', 0);
    cy.get('body').invoke('css', 'height', 'auto');
}

run({
    baseUrl,
    endpoints,
    viewports,
    // Don't forget to add the new options here!
    suiteName,
    formatUrl,
    onPageVisit,
});

```

</details>

<details>

<summary>Typescript</summary>

```typescript
// snaps.cy.ts
import { run, VisregViewport, Endpoint, TestProps, CypressCy, FormatUrl, OnPageVisit } from 'visreg-test';

/**
 * CypressCy is the type of the cy object, which is used to interact with the page. You only need to declare this if you are using onPageVisit functions and don't want typescript to complain, otherwise you can ignore it.
 */
declare const cy: CypressCy;

const baseUrl: string = 'https://developer.mozilla.org';

const viewports: VisregViewport[] = [
    'iphone-6',
];

const endpoints: Endpoint[] = [
    {
        title: 'Start',
        path: '/',
        /**
         * Blackout elements from the snapshot, useful for elements that change frequently and are not relevant to the test.
         */
        blackout: ['#sidebar', '.my-selector', 'footer'],
        /**
         * Capture a screenshot of a specific element on the page, rather than the whole page.
         */
        elementToMatch: ['div[data-testid="my-element"]'],
        /**
         * Padding to add to the element screenshot. Ignored if elementToMatch is not set.
         */
        padding: [20, 40],
        /**
         * Valid values are viewport or fullPage.
         * Whether to capture the viewport or the whole page.
         * This value is ignored for element screenshot captures.
         */
        capture: 'viewport',
        /**
         * Place to do manipulate the page specified in the endpoint before taking the snapshot.
         */
        onEndpointVisit: () => {
            cy.get('button[id="expand-section"]').click();
        },
    },
    {
        title: 'Guides',
        path: '/en-US/docs/Learn',
    }
];

/**
 * This is only used when displaying the test results in the terminal.
 */
const suiteName: string = 'MDN';

/**
 * Apply some formatting to the url before a snapshot is taken, e.g. to add query params to the url.
 */
const formatUrl: FormatUrl = (path) => {
    return `${baseUrl}${path}?noexternal`;
}

/**
 * Code here will run when cypress has loaded the page but before it starts taking snapshots. Useful to prepare the page, e.g. by clicking to bypass cookie banners or hiding certain elements.
 */
const onPageVisit: OnPageVisit = () => {
    cy.get('header').invoke('css', 'opacity', 0);
    cy.get('body').invoke('css', 'height', 'auto');
}

const options: TestProps = {
    baseUrl,
    endpoints,
    viewports,
    // Don't forget to add the new options here!
    suiteName,
    formatUrl,
    onPageVisit,
};

run(options);

```

</details>
<br>

To create another test suite, simply create a new directory and add a `snaps.cy` file to it (`snaps.cy.js or snaps.cy.ts`). When you run the tests you will be prompted to select which test suite to run.


## Running the tests

- Run `npx visreg-test` from your project
- Select a suite 
- Select the type of test to run
- Wait for the tests to finish
- A preview of diffing snapshots will be shown
- Accept or reject them as the new baseline
- Repeat until all diffs have been assessed

After running the tests your project will look something like this:

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


There are 3 **types** of test:

- **Full suite:** run all tests in a suite and generate new baseline snapshots
- **Retest diffs:** only run tests which failed in the last run
- **Assess diffs**: assess existing diffs (no tests are run)




<br>

# Development

Want to contribute? Great! Here's how to get started:

## Setup dev environment

- Clone this repo and run `npm install` to install the dependencies, e.g. into a directory called `visreg/repo`.
- Create a directory for testing the module elsewhere (e.g. `visreg/dev-testing-grounds`) and set up the tests according to the instructions above.
- After installing the npm visreg-test package you should now have a `visreg/dev-testing-grounds/node_modules/visreg-test/dist` directory. Delete the contents of it.
- From `visreg/repo` run `npm run create-symlink -- [Absolute path]` where the absolute path should be your newly created testing directory (i.e. using the examples above it should be something like `npm run create-symlink -- /Users/.../dev-testing-grounds`). Please note that the path should not end with a slash, because we append some stuff to it.
- This will create a symlink between the `dist` directory in the repo and the `node_modules/visreg-test` directory in your testing directory.

## Running dev mode

- From `visreg/repo` run `npm run dev` to start watching the files and compiling them to the `dist` directory, which will be mirrored to your testing directory. Any changes you make will automatically be reflected in your testing directory visreg-test package, allowing you to test your changes to the package in real time without having to publish and reinstall it all of the time.
- From your testing directory, run the tests. Normally you would use `npx visreg-test` to do so, but due to the symlinking npx doesn't work (you'll get a "permission denied"), so you need to explicityly run it like so, instead: `node ./node_modules/.bin/visreg-test`.
- You should now see the changes you made to the package reflected in the tests.




<br>

# Configuration options

You can configure certain settings with a `visreg.config.json` file placed in the root of your project. E.g.:



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

`screenshotOptions` and `comparisonOptions` are the options that will be passed to Cypress and the Jest comparison engine respectively. 

>Note that certain settings are overridden by the individual endpoint options, e.g. `padding` and `capture` are overridden by the `padding` and `capture` options of an endpoint object if they exist, whereas other settings are combined, e.g. `blackout`.

```typescript

type ConfigurationOptions = {
	/**
	 * Relative or absolute path to directory of test suites.
     * Default is the root of the project, where package.json is.
	 */
    testDirectory: string;
	/**
	 * These will not be included in the selection of test.
     * node_modules is always ignored.
	 */
	ignoreDirectories: string[];
	screenshotOptions: CypressScreenshotOptions; 
	comparisonOptions: JestMatchImageSnapshotOptions;
};

/**
 * Options to pass to Cypress when taking screenshots.
 * @see https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
 * @see https://docs.cypress.io/api/commands/screenshot#Arguments
 */
export type CypressScreenshotOptions = {
	/**
	 * Array of string selectors used to match elements that should be blacked out when the screenshot is taken.
	 * Does not apply to element screenshot captures.
	 * @type {string[]}
	 * @default []
	 */
	blackout?: string[];

	/**
     * Valid values are viewport or fullPage.
	 * When fullPage, the application under test is captured in its entirety from top to bottom.
	 * This value is ignored for element screenshot captures.
	 * @type {string}
	 * @default 'fullPage'
	 */
	capture?: 'viewport' | 'fullPage';

	/**
	 * When true, prevents JavaScript timers (setTimeout, setInterval, etc) and CSS animations from running
	 * while the screenshot is taken.
	 * @type {boolean}
	 * @default true
	 */
	disableTimersAndAnimations?: boolean;

	/**
	 * Position and dimensions (in pixels) used to crop the final screenshot image. 
	 * @type {Object}
	 * @property {number} x - The x-coordinate of the top-left corner of the cropped image.
	 * @property {number} y - The y-coordinate of the top-left corner of the cropped image.
	 * @property {number} width - The width of the cropped image.
	 * @property {number} height - The height of the cropped image.
	 */
	clip?: {
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
	 */
	padding?:
	| number
	| [ number ]
	| [ number, number ]
	| [ number, number, number ]
	| [ number, number, number, number ];

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
	timeouts?: {
		defaultCommandTimeout?: 4000,
		execTimeout?: 60000,
		taskTimeout?: 60000,
		pageLoadTimeout?: 60000,
		requestTimeout?: 5000,
		responseTimeout?: 30000;
	};
};



/**
 * Options to pass to the Jest comparison engine when comparing screenshots.
 * @see https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api
 */
export type JestMatchImageSnapshotOptions = {
	/**
	 * Custom config passed to 'pixelmatch' or 'ssim'
	 */
	customDiffConfig?: {
		/**
		 * Matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive.
		 * @default 0.1
		 */
		readonly threshold?: number | undefined;

		/**
		 * If true, disables detecting and ignoring anti-aliased pixels.
		 * @default false
		 */
		readonly includeAA?: boolean | undefined;

		/**
		 * Blending factor of unchanged pixels in the diff output.
		 * Ranges from 0 for pure white to 1 for original brightness
		 * @default 0.1
		 */
		alpha?: number | undefined;

		/**
		 * The color of anti-aliased pixels in the diff output.
		 * @default [255, 255, 0]
		 */
		aaColor?: [ number, number, number ] | undefined;

		/**
		 * The color of differing pixels in the diff output.
		 * @default [255, 0, 0]
		 */
		diffColor?: [ number, number, number ] | undefined;

		/**
		 * An alternative color to use for dark on light differences to differentiate between "added" and "removed" parts.
		 * If not provided, all differing pixels use the color specified by `diffColor`.
		 * @default null
		 */
		diffColorAlt?: [ number, number, number ] | undefined;

		/**
		 * Draw the diff over a transparent background (a mask), rather than over the original image.
		 * Will not draw anti-aliased pixels (if detected)
		 * @default false
		 */
		diffMask?: boolean | undefined;
	} | Partial<{
		rgb2grayVersion: 'original' | 'integer';
		k1: number;
		k2: number;
		ssim: 'fast' | 'original' | 'bezkrovny' | 'weber';
		windowSize: number;
		bitDepth: number;
		downsample: 'original' | 'fast' | false;
		maxSize?: number;
	}> | undefined;

	/**
	 * The method by which images are compared.
	 * `pixelmatch` does a pixel by pixel comparison, whereas `ssim` does a structural similarity comparison.
	 * @default 'pixelmatch'
	 */
	comparisonMethod?: "pixelmatch" | "ssim" | undefined;

	/**
	 * Changes diff image layout direction.
	 * @default 'horizontal'
	 */
	diffDirection?: "horizontal" | "vertical" | undefined;

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
}


```

<br>

# Notes
- Does not work on Windows.
- If you only have one test suite it will be selected automatically
- This module will create, move, and delete files and directories in your test suite directories. It will not touch any files outside of the test suite directories.
