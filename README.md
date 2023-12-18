# Visreg-test

A visual regression testing solution that offers an easy setup with simple yet powerful customisation options, wrapped up in a convenient CLI runner to make assessing and accepting/rejecting diffs a breeze.

# What it does
- Run `npx visreg-test` to start the **terminal-based** test runner.
- **UI** to select which test *suite* and *type* of test to run.
- Take **snapshots** and *compare* them to existing baseline snapshots.
- **Assess** any diffs, which will be *automatically* opened in an image previewer - accept/reject them from the CLI.


## Quick links
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Setup](#setup)
    - [Structure](#structure)
    - [Test file (minimal example)](#test-file-minimal-example)
  - [Test file (full example)](#test-file-full-example)
- [Running the tests](#running-the-tests)
- [Contribution](#contribution)
  - [Setup dev environment](#setup-dev-environment)
  - [Running dev mode](#running-dev-mode)
- [Configuration](#configuration)
    - [Test options](#test-options)
    - [Endpoint options](#endpoint-options)
    - [Module configuration (*optional*)](#module-configuration-optional)
    - [Screenshot options (*optional*)](#screenshot-options-optional)
    - [Jest snapshot comparison options (*optional*)](#jest-snapshot-comparison-options-optional)
- [Notes](#notes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



<br>

# Setup

Let's install the package and create our first test suite - a directory containing a test configuration file and any generated snapshots.

Go to your project directory:
    
```
cd my-project
```

Install the package:
```
npm install visreg-test
``` 

Create a new directory for your test suites:
```
mkdir my-test-suite
```

Create a file for your test configuration:
```
touch my-test-suite/snaps.js
```

- `my-test-suite` will hold the test configuration (`snaps.js`) and store the snapshots.
- You can also use **Typescript**, so where you see `snaps.js` you can  use `snaps.ts` instead. You don't need to compile the file into javascript, the module does that automatically at runtime.

### Structure
So now your directory should look something like the following:
    
```

my-project
├── node_modules
├── package.json
├── package-lock.json
└── test-suite
   └── snaps.js

```

### Test file (minimal example)

The test configuration file is where you define how your tests should be run. Here's a **minimal example** of all you need to get started:


<details open>
<summary>JavaScript</summary>

```javascript
import { run } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

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
});
```
</details>

<details>
<summary>Typescript</summary>

```typescript
import { run, VisregViewport, Endpoint, TestProps } from 'visreg-test';

const baseUrl: string = 'https://developer.mozilla.org';
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

<!-- For more information on the options available, see [Configuration options](#configuration-options). -->

**That's it!**

You can now [run your first test](#running-the-tests).


## Test file (full example)

Realistically, you will probably want to customise the tests a bit more.

For example, if you run the minimal example above, the tests will run with the following defaults:

- Viewports to test is set to `iphone-6, ipad-2, [1920, 1080]`.
- The endpoint is captured in its entirety from top to bottom.

But you can hook into some functions and/or add some configuration options, enabling you to do things like:
- specify your own viewports
- capture the viewport instead of the full page
- format the url before taking a snapshot (e.g. to add query params)
- hide certain elements before taking snapshots (e.g. highly dynamic parts of the page which give false positives)
- take snapshots of specific elements (allows for reliable component testing)
- manipulate the page before taking snapshots (e.g. clicking away cookie consent banners or expanding sections, navigation, etc.)
- and [more](#configuration)...

Here's a slightly more realistic example, expanding on the minimal example above:

<details open>
<summary>JavaScript</summary>

```javascript
import { run } from 'visreg-test';

/**
 * This suiteName only used when displaying the test results in the terminal. Suite directory names are used by default.
 */
const suiteName = 'MDN';
const baseUrl = 'https://developer.mozilla.org';
const viewports = [
    'iphone-6',
    'ipad-2',
    [1920, 1080]
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
         * Place to manipulate the page specified in the endpoint before taking the snapshot.
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
 * Apply some formatting to the url before a snapshot is taken, e.g. to add query params to the url.
 */
const formatUrl = (path) => {
	return [ baseUrl, path, '?noexternal' ].join('');
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
    // Don't forget to add the new options here
    suiteName,
    formatUrl,
    onPageVisit,
});

```

</details>

<details>

<summary>Typescript</summary>

```typescript
import { run, VisregViewport, Endpoint, TestProps, CypressCy, FormatUrl, OnPageVisit } from 'visreg-test';

/**
 * CypressCy is the type of the cy object, which is used to interact with the page. You only need to declare this if you are using onPageVisit functions and don't want typescript to complain, otherwise you can ignore it.
 */
declare const cy: CypressCy;

/**
 * This is only used when displaying the test results in the terminal. Suite directory names are used by default.
 */
const suiteName: string = 'MDN';
const baseUrl: string = 'https://developer.mozilla.org';
const viewports: VisregViewport[] = [
    'iphone-6',
    'ipad-2',
    [1920, 1080]
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
         * Place to manipulate the page specified in the endpoint before taking the snapshot.
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
 * Apply some formatting to the url before a snapshot is taken, e.g. to add query params to the url.
 */
const formatUrl: FormatUrl = (path) => {
    return [ baseUrl, path, '?noexternal' ].join('');
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
    // Don't forget to add the new options here
    suiteName,
    formatUrl,
    onPageVisit,
};

run(options);

```

</details>
<br>

Many more options are available, see [Configuration options](#configuration-options) for more information.

To create another test suite, simply create a new directory and add a `snaps` file to it (`snaps.js or snaps.ts`). When you run visreg-test you will be prompted to select which suite to run.


# Running the tests

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
   └── snaps.js
   └── snapshots
      └── snaps
         └── Start @ iphone-6.base.png
         └── Guides @ iphone-6.base.png


```


There are 3 **types** of test:

- **Full suite:** run all tests in a suite and generate baseline snapshots or compare to existing baseline snapshots
- **Retest diffs:** only run the tests which diffed and were rejected in the last run
- **Assess diffs**: assess existing diffs (no tests are run)




<br>

# Contribution

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

# Configuration

<br>

### Test options

| Property             | Description                                                                                                 | Example                                                                                       | Type |
|-----------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|---------|
| baseUrl         | The base url of the site to test.                                                                           | `'https://developer.mozilla.org'`                                                                | `string`, *required* |
| endpoints       | An array of endpoint objects.                                                                                | `[{ title: 'Start', path: '/' }]`                | `Endpoint[]`, *required* |
| viewports       | An array of viewports to test.                                                                               | `['iphone-6', [1920, 1080]]`                                                           | `VisregViewport[]`, *optional* |
| suiteName       | The name of the test suite. This is only used when displaying the test results in the terminal.             | `'MDN'`                                                                                         | `string`, *optional* |
| formatUrl       | Apply some formatting to the url before a snapshot is taken, e.g. to add query params to the url.           | `(path) => [baseUrl, path, '?noexternal'].join('')`                                         | `(path: string) => string`, *optional* |
| onPageVisit     | Code here will run when cypress has loaded the page but before it starts taking snapshots. Useful to prepare the page, e.g. by clicking to bypass cookie banners or hiding certain elements. See https://docs.cypress.io/api/table-of-contents#Commands. | `() => { cy.get('button').click() }` | `() => void`, *optional* |

<br>

### Endpoint options

| Property             | Description                                                                                                 | Example                                                                                       | Type |
|-----------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|---------|
| title           | The title of the endpoint.                                                                                  | `'Start'`                                                                                       | `string`, *required* |
| path            | The path of the endpoint.                                                                                   | `'/start'`                                                                                      | `string`, *required*  |
| blackout        | Blackout elements from the snapshot, useful for elements that change frequently and are not relevant to the test. | `['#sidebar', '.my-selector']`                                                            | `string[]`, *optional* |
| elementToMatch  | Capture a screenshot of a specific element on the page, rather than the whole page.                        | `'.my-element'`                                                                                  | `string`, *optional* |
| padding         | Padding to add to the element screenshot. Ignored if elementToMatch is not set.                            | `[20, 40]`                                                                                       | `number[]`, *optional* |
| capture         | Valid values are viewport or fullPage. Whether to capture the viewport or the whole page. This value is ignored for element screenshot captures. | `'viewport'`                                               | `'viewport' \| 'fullPage'`, *optional* |
| onEndpointVisit | Place to manipulate the page specified in the endpoint before taking the snapshot.                      | `() => { cy.get('.cookie-consent').click(); }`                                                    | `() => void`, *optional* |


<br>

### Module configuration (*optional*)

You can configure certain settings with a `visreg.config.json` file placed in the root of your project.

*Note that certain settings are overridden by the individual endpoint options, e.g. `padding` and `capture` are overridden by the `padding` and `capture` options of an endpoint object if they exist, whereas other settings are combined, e.g. `blackout`.*


| Property | Description | Type |
|---|---|---|
| testDirectory | Path to directory of test suites. Default is the root of the project, where `package.json` is. | `string` |
| ignoreDirectories | Paths which will not be included in the selection of test. `node_modules` dir is always ignored. | `string[]` |
| screenshotOptions | Options to pass to Cypress when taking screenshots. | `CypressScreenshotOptions` |
| comparisonOptions | Options to pass to the Jest comparison engine when comparing screenshots. | `JestMatchImageSnapshotOptions` |

<br>

### Screenshot options (*optional*)

Reference:
- https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
- https://docs.cypress.io/api/commands/screenshot#Arguments
  
  
<br>

| Property | Description | Type |
| --- | --- | --- |
| blackout | Array of string selectors used to match elements that should be blacked out when the screenshot is taken. Does not apply to element screenshot captures. | `string[]` |
| capture | Valid values are viewport or fullPage. When fullPage, the application under test is captured in its entirety from top to bottom. This value is ignored for element screenshot captures. | `'fullPage' \| 'viewport'` |
| disableTimersAndAnimations | When true, prevents JavaScript timers (setTimeout, setInterval, etc) and CSS animations from running while the screenshot is taken. | `boolean` |
| clip | Position and dimensions (in pixels) used to crop the final screenshot image. | `{ x: number; y: number; width: number; height: number;	}` |
| padding | Padding used to alter the dimensions of a screenshot of an element. It can either be a number, or an array of up to four numbers using CSS shorthand notation. This property is only applied for element screenshots and is ignored for all other types. | `number \| [ number ] \| [ number, number ] \| [ number, number, number ] \| [ number, number, number, number ]` |
| timeouts | Time to wait for .screenshot() to resolve before timing out. See [cypress timeouts options](https://docs.cypress.io/guides/references/configuration.html#Timeouts)  | `{ defaultCommandTimeout?: 4000, execTimeout?: 60000, taskTimeout?: 60000, pageLoadTimeout?: 60000, requestTimeout?: 5000, responseTimeout?: 30000;	}` |

<br>

### Jest snapshot comparison options (*optional*)

Reference:
- https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api

<br>


| Property | Description | Type |
| --- | --- | --- |
| customDiffConfig | Custom config passed to 'pixelmatch' or 'ssim'. See [pixelmatch api options](https://github.com/mapbox/pixelmatch?tab=readme-ov-file#api) and [ssim options](https://github.com/obartra/ssim/wiki/Usage#options) | `PixelmatchOptions \| Partial<SSIMOptions>` |
| comparisonMethod | The method by which images are compared. `pixelmatch` does a pixel by pixel comparison, whereas `ssim` does a structural similarity comparison. | `'pixelmatch' \| 'ssim'` |
| diffDirection | Changes diff image layout direction. | `'horizontal' \| 'vertical'` |
| runtimeHooksPath | This needs to be set to a existing file, like `require.resolve('./runtimeHooksPath.cjs')`. This file can expose a few hooks: - `onBeforeWriteToDisc`: before saving any image to the disc, this function will be called (can be used to write EXIF data to images for instance) - `onBeforeWriteToDisc: (arguments: { buffer: Buffer; destination: string; testPath: string; currentTestName: string }) => Buffer` | `string` |
| dumpDiffToConsole | Will output base64 string of a diff image to console in case of failed tests (in addition to creating a diff image). This string can be copy-pasted to a browser address string to preview the diff for a failed test. | `boolean` |
| dumpInlineDiffToConsole | Will output the image to the terminal using iTerm's Inline Images Protocol. If the term is not compatible, it does the same thing as `dumpDiffToConsole`. | `boolean` |
| noColors | Removes coloring from the console output, useful if storing the results to a file. | `boolean` |
| failureThreshold | Sets the threshold that would trigger a test failure based on the failureThresholdType selected. This is different to the customDiffConfig.threshold above - the customDiffConfig.threshold is the per pixel failure threshold, whereas this is the failure threshold for the entire comparison. | `number` |
| failureThresholdType | Sets the type of threshold that would trigger a failure. | `'pixel' \| 'percent'` |
| updatePassedSnapshot | Updates a snapshot even if it passed the threshold against the existing one. | `boolean` |
| blur | Applies Gaussian Blur on compared images, accepts radius in pixels as value. Useful when you have noise after scaling images per different resolutions on your target website, usually setting its value to 1-2 should be enough to solve that problem. | `number` |



<br>

# Notes
- Does not work on Windows.
- If you only have one test suite it will be selected automatically
- This module will create, move, and delete files and directories in your test suite directories. It will not touch any files outside of the test suite directories.
- Built upon [cypress](https://www.cypress.io/), [local-cypress](https://www.npmjs.com/package/local-cypress), and [cypress-image-snapshot](https://github.com/simonsmith/cypress-image-snapshot).
