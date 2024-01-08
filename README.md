`visreg-test` enhances visual regression testing with quick setup and user-friendly yet powerful test writing, simplifying snapshot management and comparison to ensure UI consistency with minimal effort.

### Features
- Create baseline snapshots or compare to existing ones
- Automated assessment flow:
	- Diff is opened in an image previewer
	- Accept/reject the changes from the CLI
	- The next differing snapshot is opened, and so on
- Minimal setup - [get started](#setup) in minutes
- Multiple [test modes](#running-tests)
- ["Lab mode"](#lab-mode) - for visualising and developing your tests in the Cypress GUI
- [Simple API](#writing-tests) - write your tests in a single file
- [Customise](#optional-configuration) your tests, enabling you to do things like:
  - specify your viewports
  - capture the full page or just a portion of it
  - take snapshots of specific elements
  - hide certain elements
  - manipulate the page
  - format the url
  - and more...

<br>

# Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [About](#about)
- [Setup](#setup)
    - [Typescript](#typescript)
    - [Folder structure](#folder-structure)
- [Writing tests](#writing-tests)
    - [Minimal example](#minimal-example)
  - [Full example](#full-example)
- [Running tests](#running-tests)
  - [Updated folder structure](#updated-folder-structure)
  - [Flags](#flags)
  - [Lab mode](#lab-mode)
- [Contribute](#contribute)
- [Optional Configuration](#optional-configuration)
- [Notes](#notes)
- [Credits](#credits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br>

# About

Other solutions often stumble in a few important ways:

- Too complex and fragile, requiring a lot of setup and configuration
- No granular control - run all the tests or none at all.
- Assumes that all diffs are bad - handling of acceptable diffs, i.e. updating a baseline, usually entails running the test again with a flag which updates *all* snapshots, or the user manually has to delete the old baseline and replace it with the diffing file - if the diffing result, not just the diff between them, was even saved in the first place. This is tedious and error-prone.

`visreg-test` aims to solve these problems by providing a simple yet powerful API and automating the process of evaluating and approving changes, allowing you to focus on the important part - guarding your UI against regressions.



<br>

# Setup

Let's install the package and create our first test suite - a directory containing a test configuration file and any generated snapshots.

Navigate to your project directory (or create one), then install the package:

```bash
npm install visreg-test
``` 

Create a directory for your first test suite:
```bash
mkdir my-test-suite
```

Create a file for your test configuration:
```bash
touch my-test-suite/snaps.js
# or
touch my-test-suite/snaps.ts # if using typescript
```

### Typescript 

For full typescript support, install it:

```bash
npm install --save-dev typescript
```

And add a `tsconfig.json` file to the root of your project:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
  },
  "include": ["**/*.ts"]
}
```


### Folder structure
At this point your directory should look something like the following:
    
```
my-project
├── node_modules
├── package.json
├── package-lock.json
├── tsconfig.json (if using typescript)
└── my-test-suite
   └── snaps.js (or snaps.ts)
```

<br>

# Writing tests

The test configuration file (`snaps.js/ts`) is where you define how your tests should be run, which endpoints to test, which viewports to test them in, and any other customisations you want to make.

Let's create a minimal example first, followed by a more realistic and fleshed-out one after that.

### Minimal example

<details open>
<summary>JavaScript</summary>

```javascript
import { run } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const endpoints = [ {
   title: 'Start',
   path: '/',
} ];

run({
   baseUrl,
   endpoints,
});
```
</details>

<details>
<summary>Typescript</summary>

```typescript
import { run, VisregViewport, Endpoint, TestConfig } from 'visreg-test';

const baseUrl: string = 'https://developer.mozilla.org';

const endpoints: Endpoint[] = [ {
   title: 'Start',
   path: '/',
} ];

const config: TestConfig = {
   baseUrl,
   endpoints,
   viewports,
};

run(config);
```

</details>
<br>


**That's it!**

You can now [run your first test](#running-tests).


## Full example

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
- and [more](#optional-configuration)...

Here's a slightly more realistic example, expanding on the minimal example above (comments explain the new bits):

<details open>
<summary>JavaScript</summary>

```javascript
import { run } from 'visreg-test';

const suiteName = 'MDN'; // only used when displaying the test results in the terminal. Suite directory names are used by default.
const baseUrl = 'https://developer.mozilla.org';
const viewports = [
   'iphone-x',
   'samsung-s10',
   [ 960, 540 ]
];

const endpoints = [
   {
      title: 'Start',
      path: '/',
      blackout: [ '#sidebar', '.my-selector', 'footer' ], // Blackout elements from the snapshot
      onEndpointVisit: (cy, cypress) => {
         // Place to manipulate the page specified in the endpoint before taking the snapshot.
         cy.get('button[id="expand-section"]').click();

         const mobile = cypress.currentTest.title.includes('iphone-6');
         if (mobile) {
            cy.get('.mobile-button').click();
         }
      },
   },
   {
      title: 'Guides',
      path: '/en-US/docs/Learn',
   }
];


const formatUrl = (path) => {
   // Format to the url before a snapshot is taken
   return [ baseUrl, path, '?noexternal' ].join('');
};

const onPageVisit = (cy, cypress) => {
   // Code here will run when cypress has loaded the page but before it starts taking snapshots
   cy.get('header').invoke('css', 'opacity', 0);
   cy.get('body').invoke('css', 'height', 'auto');
};

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
import { run, VisregViewport, Endpoint, TestConfig, CypressCy, FormatUrl, OnPageVisit } from 'visreg-test';

const suiteName: string = 'MDN'; // only used when displaying the test results in the terminal. Suite directory names are used by default.
const baseUrl: string = 'https://developer.mozilla.org';
const viewports: VisregViewport[] = [
   'iphone-x',
   'samsung-s10',
   [ 960, 540 ]
];

const endpoints: Endpoint[] = [
   {
      title: 'Start',
      path: '/',
      blackout: [ '#sidebar', '.my-selector', 'footer' ], // Blackout elements from the snapshot
      onEndpointVisit: (cy: cy, cypress: Cypress) => {
         // Place to manipulate the page specified in the endpoint before taking the snapshot.
         cy.get('button[id="expand-section"]').click();

         const mobile = cypress.currentTest.title.includes('iphone-6');
         if (mobile) {
            cy.get('.mobile-button').click();
         }
      },
   },
   {
      title: 'Guides',
      path: '/en-US/docs/Learn',
   }
];

const formatUrl: FormatUrl = (path) => {
   // Format to the url before a snapshot is taken
   return [ baseUrl, path, '?noexternal' ].join('');
};

const onPageVisit: OnPageVisit = (cy: cy, cypress: Cypress) => {
   // Code here will run when cypress has loaded the page but before it starts taking snapshots
   cy.get('header').invoke('css', 'opacity', 0);
   cy.get('body').invoke('css', 'height', 'auto');
};

const config: TestConfig = {
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

Many more options are available, see [Configuration](#optional-configuration) for more information.

To create another test suite, simply create a new directory and add a `snaps` file to it (`snaps.js or snaps.ts`). When you run visreg-test you will be prompted to select which suite to run.


# Running tests

**Creating baselines**

- Run `npx visreg-test` from your project
- When prompted, select the type of test to run - select `"Full"` your first time

`visreg-test` will now go through all your endpoints and viewports and if there are no previous images to compare to it will create baseline snapshots.

>💡 You can specify what to run (and more) via [flags](#flags).
>
> 🗒️ If you only have one suite, it will be selected automatically. If you have multiple suites, you will be prompted to select one.

**Visual regression testing**

- Run `npx visreg-test` and select `"Full"` again
- Comparisons will be made against the baselines
- Diffs will be opened in an image previewer
- Accept/reject the changes from the CLI

If you reject a diff it will be stored in the diffs directory. Next time you run `visreg-test` you can select `"Retest diffs only"` to only run the tests against these. Fix your issues, retest diffs, and repeat until there are no diffs left.


**Types of test**

- **Full** - run all tests in a suite and generate baseline snapshots or compare to existing baseline snapshots (previous diffs are deleted)
- **Retest diffs only** - only run the tests which diffed and were rejected in the last run
- **Assess diffs** - assess existing diffs (no tests are run)
- **Lab** - visualise and develop your tests in the Cypress GUI, isolated from the rest of your snapshots and with hot reloading.



## Updated folder structure

After running the tests the first time your project will look something like this:

```
my-project
├── node_modules
├── package.json
├── package-lock.json
├── tsconfig.json (if using typescript)
└── test-suite
   └── snaps.js (or snaps.ts)
   └── snapshots
      └── snaps  
         ├── Guides @ iphone-x.base.png
         ├── Guides @ 960,540.base.png
         ├── Start @ iphone-x.base.png
         └── Start @ 960,540.base.png
```

And after running the tests again, this time with diffs:

```
my-project
├── node_modules
├── package.json
├── package-lock.json
├── tsconfig.json (if using typescript)
└── test-suite
   └── snaps.js (or snaps.ts)
   └── snapshots
      └── snaps  
         ├── __diffs__
         │  ├── Guides @ iphone-x.diff.png
         │  └── Guides @ 960,540.diff.png
         ├── __received__
         │  ├── Guides @ iphone-x-received.png
         │  └── Guides @ 960,540-received.png
         ├── Guides @ iphone-x.base.png
         ├── Guides @ 960,540.base.png
         ├── Start @ iphone-x.base.png
         └── Start @ 960,540.base.png
```


## Flags

Flags just allow you to skip the UI and run specific tests. The complete list is:

```bash
-f, --full-test <spec> 
-d, --diffs-only <spec>
-a, --assess-existing-diffs <spec>
-lab, --lab-mode <spec>
# accepts an optional shorthand argument to specify what to test, e.g. "my-test-suite:Home-page@iphone-6"

-no-gui, --no-gui
# run lab mode without the Cypress GUI

-no-snap, --no-snap
# skip taking snapshots

-s, --suite <suite name>
# <suite name> is the directory name of the suite to run

-e, --endpoint-title <endpoint title> 
# <endpoint title> is the title, but where any spaces must be replaced by dashes, e.g. "Getting Started" becomes "Getting-Started" (or "getting-started" as it's case insensitive)

-v, --viewport <viewport>
# <viewport> is a string, e.g. "iphone-6" or "1920,1080"
```
 

For example, to re-run a test for the diffing snapshots with the viewport `samsung-s10` (in the `my-test-suite` suite), you could run either of these:

```bash
npx visreg-test --diffs-only --suite my-test-suite --viewport samsung-s10
# or
npx visreg-test -d -s my-test-suite -v samsung-s10
# or
npx visreg-test -d my-test-suite@samsung-s10
```

**Shorthand spec**

The shorthand specification format is `suite:endpoint-title@viewport`. If you only have one suite, you can omit the suite name. Endpoint is prefaced with `:`, viewport is prefaced with  `@`. All are optional.


**Examples:**

```bash
# run the diffs-only tests in the "my-test-suite" suite
-d my-test-suite

# only test the Home endpoint. 
-f my-test-suite:Home

# test the Home endpoint in all viewports (If you only have one suite, you can omit the suite name)
-f :Home

# assess only the Home endpoint with the samsung-s10 viewport
-a :Home@samsung-s10

# isolated test for "Getting started" endpoint with the samsung-s10 viewport
-lab :getting-started@samsung-s10
```


## Lab mode

A way to develop and try out your code before it's used in a real test.

- See the test in real-time in the Cypress GUI
- Hot reloading for quick iteration
- Screenshots are saved in an isolated "lab" directory
- No diffs are generated
- Only runs a single specified test

Once Cypress opens, click on `E2E Testing`, then select the Electron browser and click `Start E2E Testing in Electron`, and then click on your suite and finally `snaps.js` (or `snaps.ts` if using typescript) to run the test.

There are two lab-only flags:

```bash
-no-gui
-no-snap
```

By default lab mode is run within the Cypress GUI, but you can run it in the terminal (this will also disable hot reloading).

```bash
npm visreg-test -lab my-test-suite:Start@iphone-6 -no-gui
```

You can also skip taking snapshots altogether, which is especially useful if you're just using lab mode to develop your tests.

```bash
npm visreg-test -lab my-test-suite:Start@iphone-6 -no-snap
```


<br>

# Contribute

Want to contribute? Great! Here's how to get started:

**Setup dev environment**

- Clone this repo and run `npm install` to install the dependencies, e.g. into a directory called `visreg/repo`.
- Create a directory for testing the module elsewhere (e.g. `visreg/dev-testing-grounds`) and set up the tests according to the instructions above.
- After installing the npm visreg-test package you should now have a `visreg/dev-testing-grounds/node_modules/visreg-test/dist` directory. Delete it.
- From `visreg/repo` run `npm run create-symlink -- [Absolute path]` where the absolute path should be your newly created testing directory (i.e. using the examples above it should be something like `npm run create-symlink -- /Users/.../dev-testing-grounds`). Please note that the path should not end with a slash, because we append some stuff to it.
- This will create a symlink between the `dist` directory in the repo and the `node_modules/visreg-test` directory in your testing directory.

<br>

**Running dev mode**

- From `visreg/repo` run `npm run dev` to start watching the files and compiling them to the `dist` directory, which will be mirrored to your testing directory if you followed the dev setup. Any changes you make will automatically be reflected in your testing directory visreg-test package, allowing you to test your changes to the package in real time without having to publish and reinstall it all of the time.
- From your testing directory, run the tests. Normally you would use `npx visreg-test` to do so, but due to the symlinking npx doesn't work (you'll get a "permission denied"), so you need to explicityly run it like so, instead: `node ./node_modules/.bin/visreg-test`.
- You may need to give the symlinked directory permissions to run, so run `chmod +x ./node_modules/.bin/visreg-test`.
- You should now see the changes you made to the package reflected in the tests.




<br>

# Optional Configuration

Reference the [typescript](#full-example) test examples for what goes where.

Default values are as follows:

```javascript
capture: 'fullPage',
viewports: [ 'iphone-6', 'ipad-2', [ 1920, 1080 ] ],
failureThresholdType: 'percent',
failureThreshold: 0.02,
disableTimersAndAnimations: false,
scrollDuration: 1000,
```



<br>


**Test config | TestConfig | (*required*)**

| Property        | Description                                                                                                 | Example                                                                                       | Type |
|-----------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|---------|
| baseUrl         | The base url of the site to test.                                                                           | `'https://developer.mozilla.org'`                                                                | `string`, *required* |
| endpoints       | An array of endpoint objects.                                                                                | `[{ title: 'Start', path: '/' }]`                | `Endpoint[]`, *required* |
| viewports       | An array of viewports to test.                                                                               | `['iphone-6', [1920, 1080]]`                                                           | `VisregViewport[]`, *optional* |
| suiteName       | The name of the test suite. This is only used when displaying the test results in the terminal.             | `'MDN'`                                                                                         | `string`, *optional* |
| formatUrl       | Apply some formatting to the url before a snapshot is taken, e.g. to add query params to the url.           | `(path) => [baseUrl, path, '?noexternal'].join('')`                                         | `(path: string) => string`, *optional* |
| onPageVisit     | Code here will run when cypress has loaded the page but before it starts taking snapshots. Useful to prepare the page, e.g. by clicking to bypass cookie banners or hiding certain elements. See https://docs.cypress.io/api/table-of-contents#Commands. | `() => { cy.get('button').click() }` | `OnVisitFunction`, *optional* |

<br>
<br>

**OnVisitFunction passed props**

| Property        | Description                                                                                                 | Example                                                                                       | Type |
|-----------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|---------|
| cy              | The chainable cypress cy object to manipulate the page. See [Cypress API](https://docs.cypress.io/api/table-of-contents#Cypress-API)                                                                 | `cy.get('button').click()`                                                                     | `cy`, *required* |
| cypress         | Holds bundled Cypress utilities and constants. See [Cypress API](https://docs.cypress.io/api/table-of-contents#Cypress-API)                                                                                         | `cypress.currentTest.title.includes('iphone-6')`                                                | `Cypress`, *required* |


<br>
<br>

**Endpoint config | Endpoint | (*required*)**

| Property        | Description                                                                                                 | Example                                                                                       | Type |
|-----------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|---------|
| title           | The title of the endpoint.                                                                                  | `'Start'`                                                                                       | `string`, *required* |
| path            | The path of the endpoint.                                                                                   | `'/start'`                                                                                      | `string`, *required*  |
| onEndpointVisit | Place to manipulate the page specified in the endpoint before taking the snapshot.                      | `(cy: cy, cypress: Cypress) => { cy.get('.cookie-consent').click(); }`                                                    | `OnVisitFunction`, *optional* |
| elementToMatch  | Capture a screenshot of a specific element on the page, rather than the whole page.                        | `'.my-element'`                                                                                  | `string`, *optional* |
| screenshotOptions | The properties of CypressScreenshotOptions of the module configuration are all applicable here | `blackout: ['#sidebar', '.my-selector']`                                                            | `...CypressScreenshotOptions`, *optional* |
| comparisonOptions | The properties of JestMatchImageSnapshotOptions of the module configuration are all applicable here | `customDiffConfig: { threshold: 0.1 }`                                                            | `...JestMatchImageSnapshotOptions`, *optional* |

<br>
<br>

**Module configuration | ConfigurationSettings | (*optional*)**

You can configure certain settings with a `visreg.config.json` file placed in the root of your project.

>🗒️ Certain settings are overridden by the individual endpoint options, e.g. `padding` and `capture` are overridden by the `padding` and `capture` options of an endpoint object if they exist, whereas other settings are combined, e.g. `blackout`.


| Property | Description | Type |
|---|---|---|
| testDirectory | Path to directory of test suites. Default is the root of the project, where `package.json` is. | `string` |
| ignoreDirectories | Paths which will not be included in the selection of test. `node_modules` dir is always ignored. | `string[]` |
| maxViewport | Should have a higher value than the viewport you want to test. Default is `1920x1080` | `{ width?: number, height?: number }` |
| screenshotOptions | Options to pass to Cypress when taking screenshots. | `CypressScreenshotOptions` |
| comparisonOptions | Options to pass to the Jest comparison engine when comparing screenshots. | `JestMatchImageSnapshotOptions` |

<br>
<br>

**Screenshot options | CypressScreenshotOptions | (*optional*)**

Reference:
- https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
- https://docs.cypress.io/api/commands/screenshot#Arguments
  
  
<br>

| Property | Description | Type |
| --- | --- | --- |
| scrollDuration | Scroll speed prior to capture. If not using IntersectionObserver you can probably set this to 0. Default is `1000` milliseconds.  | `number` |
| blackout | Array of string selectors used to match elements that should be blacked out when the screenshot is taken. Does not apply to element screenshot captures. | `string[]` |
| capture | Valid values are viewport or fullPage. When fullPage, the application under test is captured in its entirety from top to bottom. This value is ignored for element screenshot captures. | `'fullPage' \| 'viewport'` |
| disableTimersAndAnimations | When true, prevents JavaScript timers (setTimeout, setInterval, etc) and CSS animations from running while the screenshot is taken. Default is `false` | `boolean` |
| clip | Position and dimensions (in pixels) used to crop the final screenshot image. | `{ x: number; y: number; width: number; height: number;	}` |
| padding | Padding used to alter the dimensions of a screenshot of an element. It can either be a number, or an array of up to four numbers using CSS shorthand notation. This property is only applied for element screenshots and is ignored for all other types. | `number \| [ number ] \| [ number, number ] \| [ number, number, number ] \| [ number, number, number, number ]` |
| timeouts | Time to wait for .screenshot() to resolve before timing out. See [cypress timeouts options](https://docs.cypress.io/guides/references/configuration.html#Timeouts)  | `{ defaultCommandTimeout?: 4000, execTimeout?: 60000, taskTimeout?: 60000, pageLoadTimeout?: 60000, requestTimeout?: 5000, responseTimeout?: 30000;	}` |

<br>
<br>

**Comparison options | JestMatchImageSnapshotOptions | (*optional*)**

Reference:
- https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api

<br>


| Property | Description | Type |
| --- | --- | --- |
| customDiffConfig | Custom config passed to 'pixelmatch' or 'ssim'. See [pixelmatch api options](https://github.com/mapbox/pixelmatch?tab=readme-ov-file#api) and [ssim options](https://github.com/obartra/ssim/wiki/Usage#options) | `PixelmatchOptions \| Partial<SSIMOptions>` |
| comparisonMethod | The method by which images are compared. `pixelmatch` does a pixel by pixel comparison, whereas `ssim` does a structural similarity comparison. | `'pixelmatch' \| 'ssim'` |
| diffDirection | Changes diff image layout direction. | `'horizontal' \| 'vertical'` |
| noColors | Removes coloring from the console output, useful if storing the results to a file. | `boolean` |
| failureThreshold | Sets the threshold that would trigger a test failure based on the failureThresholdType selected. This is different to the customDiffConfig.threshold above - the customDiffConfig.threshold is the per pixel failure threshold, whereas this is the failure threshold for the entire comparison. | `number` |
| failureThresholdType | Sets the type of threshold that would trigger a failure. | `'pixel' \| 'percent'` |
| blur | Applies Gaussian Blur on compared images, accepts radius in pixels as value. Useful when you have noise after scaling images per different resolutions on your target website, usually setting its value to 1-2 should be enough to solve that problem. | `number` |



<br>

# Notes
- If you only have one test suite it will be selected automatically.
- Green checks in the UI indicate that the test ran successfully, not that no diffs were detected. Diffs will be opened for preview at the end of the test run.
- High-resolution, full-page, long pages take more time to process. Consider increasing the timeouts in the `visreg.config` file if you're timing out.
- SSIM comparison requires more memory than pixelmatch, so if you're running into memory issues, try using pixelmatch instead (which is the default).
- Logging: use cy.log() to log to the console. This will be displayed in the terminal when running the tests. Typescript will complain if you're passing an object and not a string, but you can cast it to "any" to get around that.
- Does not work on Windows (yet). Untested on Linux (currently)
- If you get an error: `"The 'files' list in config file 'tsconfig.json' is empty"` it means you're attempting to run tests written in typescript but haven't followed the instructions above to set up typescript support.
- This module will create, move, and delete files and directories in your test suite directories. It will not touch any files outside of the test suite directories.
- When taking snapshots in lab mode, if you have the dev tools panel open in the Cypress GUI, the snapshots will be cropped by that portion of the screen. Simply close the dev tools panel before taking a snapshot to avoid this.

# Credits

`visreg-test` utilizes [Cypress](https://www.cypress.io/) and [cypress-image-snapshot](https://www.npmjs.com/package/@simonsmith/cypress-image-snapshot) for the heavy lifting and image diffing, encapsulating them in a simple API and automating the process of evaluating and approving changes.
