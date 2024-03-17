# visreg-test

[![npm version](https://badge.fury.io/js/visreg-test.svg)](https://badge.fury.io/js/visreg-test)

`visreg-test` enhances visual regression testing with quick setup and user-friendly yet powerful test writing, simplifying snapshot management and comparison to ensure UI consistency with minimal effort.

## Release notes


**Added a [web interface](#web-interface) in v4.0.0!**

**Added [docker support](#docker) in v3.0.0!**

>❗<u>Breaking change updating to 3.0.0</u>:
> - Your suites directories will need to be moved into a [directory called "suites"](#folder-structure) in the root of your project (this is to make it easier to find the tests when running the containerized version of the test runner).
> - [Flags](#flags) have been updated to be more consistent and user-friendly.


## Features
- Create baseline snapshots or compare to existing ones
- Automated assessment flow, in the CLI or in a [web interface](#web-interface):
- Minimal setup - [get started](#setup) in minutes
- Multiple [test modes](#running-tests)
- ["Lab mode"](#lab-mode) - for visualising and developing your tests in the Cypress GUI
- [Simple API](#writing-tests) - write your tests in a single file
- [Docker support](#docker) - run your tests in a consistent environment
- [Web interface](#web-interface) - view your snapshots, see the details of your configuration, assess diffs, and more
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
  - [Quick start](#quick-start)
  - [Step by step](#step-by-step)
    - [Typescript](#typescript)
    - [Folder structure](#folder-structure)
  - [Docker setup (optional)](#docker-setup-optional)
- [Writing tests](#writing-tests)
    - [Minimal example](#minimal-example)
  - [Full example](#full-example)
- [Running tests](#running-tests)
  - [Updated folder structure](#updated-folder-structure)
  - [Flags](#flags)
  - [Lab mode](#lab-mode)
- [Web interface](#web-interface)
- [Docker](#docker)
  - [Pre-requisites](#pre-requisites)
  - [Running the container](#running-the-container)
- [Contribute](#contribute)
  - [Local development (outside of the container)](#local-development-outside-of-the-container)
  - [Developing with the container](#developing-with-the-container)
  - [Testing the package before publishing](#testing-the-package-before-publishing)
  - [Web interface](#web-interface-1)
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

## Quick start

💡 You can follow the step-by-step directory/file creation below or simply run the commands below from your project directory to scaffold everything and get going right away.

Assuming you want to use typescript and run the tests in a container, run the following commands:


```bash
npm install visreg-test
npx visreg-test --scaffold-ts
npm install --save-dev typescript
npx visreg-test --run-container
```

## Step by step


Navigate to your project directory (or create one), then install the package:

```bash
npm install visreg-test
``` 


Create a directory to host your suites, and create your first test suite directory in it:
```bash
mkdir suites && cd suites && mkdir test-suite
```

Create a file for your test configuration:
```bash
touch test-suite/snaps.js
# or
touch test-suite/snaps.ts # if using typescript
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
└── suites
   └── test-suite
      └── snaps.js (or snaps.ts)
```

## Docker setup (optional)

If you want to run the tests in a container (recommended), after following the steps above, run: 

```bash
npx visreg-test --run-container
```

[Read more](#docker)


<br>

# Writing tests

The test configuration file (`snaps.js/ts`) is where you define how your tests should be run, which endpoints to test, which viewports to test them in, and any other customisations you want to make.

Let's create a minimal example first, followed by a more realistic and fleshed-out one after that.

### Minimal example

<details open>
<summary>JavaScript</summary>

```javascript
import { runVisreg } from 'visreg-test';

const baseUrl = 'https://developer.mozilla.org';

const endpoints = [ {
   title: 'Start',
   path: '/',
} ];

runVisreg({
   baseUrl,
   endpoints,
});
```
</details>

<details>
<summary>Typescript</summary>

```typescript
import { runVisreg, VisregViewport, Endpoint, TestConfig } from 'visreg-test';

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

runVisreg(config);
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
import { runVisreg } from 'visreg-test';

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
      onEndpointVisit: (cy, context) => {
         // Place to manipulate the page specified in the endpoint before taking the snapshot.
         cy.get('button[id="expand-section"]').click();

         const mobile = context.viewport === 'ipad-2';
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

const onPageVisit = (cy, context) => {
   // Code here will run when cypress has loaded the page but before it starts taking snapshots
   cy.get('header').invoke('css', 'opacity', 0);
   cy.get('body').invoke('css', 'height', 'auto');
};

runVisreg({
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
import { runVisreg, VisregViewport, Endpoint, TestConfig, FormatUrl, OnPageVisit } from 'visreg-test';

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
      onEndpointVisit: (cy: cy, context: TestContext) => {
         // Place to manipulate the page specified in the endpoint before taking the snapshot.
         cy.get('button[id="expand-section"]').click();

         const mobile = context.viewport === 'ipad-2';
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

const onPageVisit: OnPageVisit = (cy: cy, context: TestContext) => {
   // Code here will run when cypress has loaded the page but before it starts taking snapshots
   cy.get('header').invoke('css', 'opacity', 0);
   cy.get('body').invoke('css', 'height', 'auto');
};

runVisreg({
   baseUrl,
   endpoints,
   viewports,
   // Don't forget to add the new options here
   suiteName,
   formatUrl,
   onPageVisit,
} as TestConfig);

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
└── suites
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
└── suites
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
-t, --targetted <spec>
-d, --diffs-only <spec>
-a, --assess-existing-diffs <spec>
# accepts an optional shorthand argument to specify what to test, e.g. "test-suite:Home-page@iphone-6"
-l, --lab-mode <spec>

# run lab mode without the Cypress GUI
-ng, --no-gui

# skip taking snapshots
-ns, --no-snap

# <suite name> is the directory name of the suite to run
-s, --suite <suite name>

# <endpoint title> is the title, but where any spaces must be replaced by dashes, e.g. "Getting Started" becomes "Getting-Started" (or "getting-started" as it's case insensitive)
-e, --endpoint-title <endpoint title> 

# <viewport> is a string, e.g. "iphone-6" or "1920,1080"
-v, --viewport <viewport>

# scaffolds a test suite for you to get started with
-sc, --scaffold
-sct, --scaffold-ts

# run the containerized version of the test runner
-r, --run-container
-b, --build-container

# start the web interface
-ss, --server-start
```
 

For example, to re-run a test for the diffing snapshots with the viewport `samsung-s10` (in the `test-suite` suite), you could run either of these:

```bash
npx visreg-test --diffs-only --suite test-suite --viewport samsung-s10
# or
npx visreg-test -d -s test-suite -v samsung-s10
# or
npx visreg-test -d test-suite@samsung-s10
```

**Shorthand spec**

The shorthand specification format is:

```bash
suite:endpoint-title@viewport
```

If you only have one suite, you can omit the suite name. Endpoint is prefaced with `:`, viewport is prefaced with  `@`. All are optional. Non-string viewport values should be separated by a comma, e.g. `360,1400`.


**Examples:**

```bash
# run the diffs-only tests in the "test-suite" suite
--diffs-only test-suite
-d test-suite

# only test the Home endpoint. 
--full-test test-suite:Home
-f test-suite:Home

# test the Home endpoint in all viewports (If you only have one suite, you can omit the suite name)
--full-test :Home
-f :Home

# this acts like the full-test, but crucially it doesn't delete the previous diffs
--targetted test-suite:Home
-t test-suite:Home

# assess only the Home endpoint with the samsung-s10 viewport
--assess-existing-diffs :Home@samsung-s10
-a :Home@samsung-s10

# isolated test for "Getting started" endpoint with the samsung-s10 viewport
--lab-mode :getting-started@samsung-s10
-l :getting-started@samsung-s10
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
--no-gui
--no-snap
```

By default lab mode is run within the Cypress GUI, but you can run it in the terminal (this will also disable hot reloading).

```bash
npm visreg-test --lab-mode test-suite:Start@iphone-6 --no-gui
```

You can also skip taking snapshots altogether, which is especially useful if you're just using lab mode to develop your tests.

```bash
npm visreg-test --lab-mode test-suite:Start@iphone-6 --no-snap
```

# Web interface

New in v4.0.0, `visreg-test` now has a web interface for assessing diffs and viewing snapshots.

This is especially useful if you're running tests in a CI/CD pipeline, as it allows you to view the snapshots and diffs by visiting a URL.

To start the web interface, run:

```bash
npx visreg-test --server-start # or -ss
```

The interface will be available at `localhost:3000`.

When running the tests, at the start of assessment you will get the choice to continue in the terminal or open the web interface. If you choose the latter, the interface will open in your default browser.

Coming soon: the ability to run tests from the web interface.



# Docker

Running visreg-test in a Docker container is a great way to ensure that your tests run in a consistent environment, and it's especially useful if you're running tests in a CI/CD pipeline.

>🚧 The dockerized variant is still in development.

Features:

- You will be able to run visreg-test in both the container and locally - one doesn't exclude the other.
- You can use the same flags as you would normally.
- You only need to write your tests once, and they will work in both environments.
- The package.json is used by both environments, but each will have its own node_modules directory.
- If you install/remove a package the container will detect this and update its node_modules directory accordingly.

Limitations:

- Only Electron browser is (currently) supported in the container.
- Assessment with image previews will (currently) not work in the container - this must be triggered locally with `npx visreg-test -a` manually after the container has exited (web app coming soon).
- Cannot run lab mode in the container.
- Currently you have to install the container via the npm package, so you need to have it installed. In the future, potentially the container could be hosted on Docker Hub, and you could run it with a single command, e.g. `docker run visreg-test`. However, there are benefits to having a local install of the package, such as lab mode and typescript support in your IDE.
- You may need to pull the cypress image manually before running the container, e.g. `docker pull cypress/browsers:latest`. Unsure if this is necessary (might just be on Windows), but you'll know to try it if you get an error like `ERROR [internal] load metadata for docker.io/cypress/browsers:latest`.


## Pre-requisites

- Docker installed on your machine.
- If you are coming from < v3.0.0 you will need to place all of your test suite directories into a [directory called "suites"](#folder-structure) in the root of your project.
  
>The first time you run the container the image will be built automatically.

## Running the container

To run the container, use the `--run-container` flag:

```bash
npx visreg-test --run-container # or -r
```

If the container doesn't exist, it will be built automatically. If you want to force-build the container, use the `--build-container` flag:

```bash
npx visreg-test --build-container # or -b
```

A container directory will be added to the root of your project, which contains things needed for the container (primarily mounted volumes, enabling you to persist data between runs).

You can use the same flags as you would normally, e.g. to run a specific test:

```bash
npx visreg-test --run-container -f test-suite:Home
```

Lab mode (i.e. headed Cypress) will still run locally (not in the container). If you try to run it in the container (i.e. with the flags `--run-container --lab-mode`) it will exit with an error message.



<br>

# Contribute

Want to contribute? Great! Here's how to get started

## Local development (outside of the container)

**Setup dev environment**

- Clone this repo and run `npm install` to install the dependencies, e.g. into a directory called `visreg/repo`.
- Create a directory for testing the module elsewhere (e.g. `visreg/dev-testing-grounds`) and set up the tests according to the instructions above.
- After installing the npm visreg-test package you should now have a dist directory at `visreg/dev-testing-grounds/node_modules/visreg-test/dist` directory. Delete it.
- From `visreg/repo` run `npm run create-symlink -- [Absolute path]` where the absolute path should be your newly created testing directory (i.e. using the examples above it should be something like `npm run create-symlink -- /Users/.../dev-testing-grounds`). Please note that the path should not end with a slash, because we append some stuff to it.
- This will create a symlink between the `dist` directory in the repo and the `node_modules/visreg-test` directory in your testing directory.

<br>

**Running dev mode**

- From `visreg/repo` run `npm run dev` to start watching the files and compiling them to the `dist` directory, which will be mirrored to your testing directory if you followed the dev setup. Any changes you make will automatically be reflected in your testing directory visreg-test package, allowing you to test your changes to the package in real time without having to publish and reinstall it all of the time.
<!-- - From your testing directory, run the tests. Normally you would use `npx visreg-test` to do so, but due to the symlinking npx doesn't work (you'll get a "permission denied"), so you need to explicityly run it like so, instead: `node ./node_modules/.bin/visreg-test`. -->
- Run `npx visreg-test` from your testing directory. Give the symlinked directory permissions to run, so run `chmod +x ./node_modules/.bin/visreg-test`.
- You should now see the changes you made to the package reflected in the tests.

## Developing with the container

```bash
npm run scaffold-dev-container
```

This will create a `sandbox-project` directory in the repo root (gitignored by default) and scaffold the container directory structure, build the container, and run it. Now you can develop both the package and the container at the same time. The package will be automatically symlinked to the container, so any change are reflected in real-time.

## Testing the package before publishing

You can use `npm link` to test your package locally before publishing it. Here's how you can do it:

1. Navigate to this repo and run run npm link. This will create a global symlink to this package.

```bash
cd /path/to/visual-regression # this repo
npm link
```

1. Navigate to the project where you want to use the package and run `npm link visreg-test`. This will create a symlink in your project's node_modules directory to the global symlink.

```bash
cd /path/to/your/project
npm link visreg-test
```

Now your project will use the local version of your package. Run:

```bash
chmod +x /path/to/your/project/node_modules/.bin/visreg-test
npx visreg-test --scaffold-ts
npx visreg-test --run-container
```

This is just intended for last-minute verification in a way which is as close to a published package as possible (without the extra symlinking and mounting which is done when you run `scaffold-dev-container` and work inside the `sandbox-project`). 

<!-- TODO:  you will still need to manually run "npm run build" if you're working on the container scripts. When you run "npx visreg-test -run-container" (or "-build-container") you will be forced to give execute permissions to the ".bin/visreg-test" file again (every time). This is done in order to move the script files to the dist dir (will be fixed by using nodemon to watch non-typescript files). The container's files will NOT reflect the latest code of the package, only the code as it was when you built the image the first time (since they persist in the mounted volume). You'll need to manually copy/past the dist dir into the volume (/container/volumes/app/node_modules). Again, this is not intended for development -->

Remember to unlink the package from your project and globally when you're done testing:

```bash
cd /path/to/your/project
npm unlink visreg-test

cd /path/to/visual-regression # this repo
npm unlink -g
```

This will remove the symlinks and ensure that your project uses the published version of the package when you run npm install.

## Web interface

This package uses React for the web interface. When running in production React's files are served by the server, but when developing you need to run the server and the React dev server separately.

To run the React dev server on port 5173:

```bash
cd web
npm run dev
```

Now, from a separate terminal, navigate to a project directory on your machine and run:

```bash
NODE_ENV=development npx visreg-test --server-start # or -ss
```

This will start a server on `localhost:3000` and serve all the suites' various images.
The web interface is now available at `localhost:5173`.

The environment variable ensures that the React dev server is used instead of the production server, allowing you to see your changes in real-time. Without it, the server will serve the production build of the web interface (i.e. whatever is in the `dist/server/app` directory).

>The project directory you start the server from can be a symlinked one (e.g. `sandbox-project` if you've previously run `scaffold-dev-container`) or not - we just need to start the server from within a project in order to have any snapshots to interact with (the React dev server will attempt to make a connection to localhost:3000 and you'll be able to interact with the snapshots from there).

Note that using a **non-symlinked** project directory will **not** allow you to develop anything other than the web interface. If you want to develop the package (e.g. the server code or the test logic) and the web interface at the same time, you need to use a symlinked project.

*Hot reloading of the server is not yet implemented, so you will need to restart the server manually if you make changes to the server code.*

<br>

# Optional Configuration

Reference the [typescript](#full-example) test examples for what goes where.

Default values are as follows:

```javascript
capture: 'fullPage',
viewports: [ 'iphone-6', 'ipad-2', [ 1920, 1080 ] ],
failureThresholdType: 'percent',
failureThreshold: 0.001, // 0.1%
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
| onPageVisit     | Code here will run when cypress has loaded the page but before it starts taking snapshots. Useful to prepare the page, e.g. by clicking to bypass cookie banners or hiding certain elements. See https://docs.cypress.io/api/table-of-contents#Commands. | `() => { cy.get('button').click() }` | `EndpointHookFunction`, *optional* |

<br>
<br>

**EndpointHookFunction passed props**

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
| onBefore | Fired before onEndpointVisit, useful if you e.g. need to configure something in the CMS before taking the snapshot. You could achieve the same thing with onEndpointVisit, but this becomes more partitioned and cleaner.                       | `(cy: cy, context: TestContext) => { // change settings in CMS }`                                                    | `EndpointHookFunction`, *optional* |
| onEndpointVisit | Place to manipulate the page specified in the endpoint before taking the snapshot.                      | `(cy: cy, context: TestContext) => { cy.get('.cookie-consent').click(); }`                                                    | `EndpointHookFunction`, *optional* |
| onCleanup | Fired last, after the snapshot has been taken, useful to e.g. revert changes done in onBefore function                      | `(cy: cy, context: TestContext) => { // reset settings in CMS }`                                                    | `EndpointHookFunction`, *optional* |
| elementToMatch  | Capture a screenshot of a specific element on the page, rather than the whole page.                        | `'.my-element'`                                                                                  | `string`, *optional* |
| excludeFromTest  | A function which returns a boolean. It gets passed the same arguments as the other endpoint functions                        | `(cy: cy, context: TestContext, context: TestContext ) => { return context.viewport === 'ipad-2' }`                                                    | `ExcludeFromTestFunction`, *optional* |
| screenshotOptions | The properties of CypressScreenshotOptions of the module configuration are all applicable here | `blackout: ['#sidebar', '.my-selector']`                                                            | `...CypressScreenshotOptions`, *optional* |
| comparisonOptions | The properties of JestMatchImageSnapshotOptions of the module configuration are all applicable here | `customDiffConfig: { threshold: 0.01 }`                                                            | `...JestMatchImageSnapshotOptions`, *optional* |

<br>
<br>

**Module configuration | ConfigurationSettings | (*optional*)**

You can configure certain settings with a `visreg.config.json` file placed in the root of your project.

>🗒️ Certain settings are overridden by the individual endpoint options, e.g. `padding` and `capture` are overridden by the `padding` and `capture` options of an endpoint object if they exist, whereas other settings are combined, e.g. `blackout`.


| Property | Description | Type |
|---|---|---|
| browser | Which browser to run in headless mode. Default is Electron (Electron also currently the only supported browser when running in the container). | `'electron' | 'chrome' | 'firefox' | 'edge'` |
| ignoreDirectories | Paths which will not be included in the selection of test. | `string[]` |
| maxViewport | Should have a higher value than the viewport you want to test. Default is `1920x1080` | `{ width?: number, height?: number }` |
| imagePreviewProcess | This is for Linux users to specify the image preview program they are using and is used to automatically close the previewer at the end of diff assessment with a `pkill` command. By default visreg-test will attempt to close Gnome (i.e. 'pkill eog'). | `string` |
| disableAutoPreviewClose | Prevent visreg-test from attempting to automatically close the image previewer at the end of diff assessment. Default is `false` | `boolean` |
| screenshotOptions | Options to pass to Cypress when taking screenshots. | `CypressScreenshotOptions` |
| comparisonOptions | Options to pass to the Jest comparison engine when comparing screenshots. | `JestMatchImageSnapshotOptions` |

<br>
<br>

**Screenshot options | CypressScreenshotOptions | (*optional*)**

Reference:
- https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
- https://docs.cypress.io/api/commands/screenshot#Arguments
- https://github.com/bahmutov/cypress-network-idle
  
  
<br>

| Property | Description | Type |
| --- | --- | --- |
| waitForNetworkIdle | Wait for network requests to stop before taking a screenshot. Default is `true` | `boolean` |
| scrollDuration | Scroll speed prior to capture. If not using IntersectionObserver you can probably set this to 0. Default is `1000` milliseconds.  | `number` |
| blackout | Array of string selectors used to match elements that should be blacked out when the screenshot is taken. Does not apply to element screenshot captures. | `string[]` |
| capture | Valid values are viewport or fullPage. When fullPage, the application under test is captured in its entirety from top to bottom. This value is ignored for element screenshot captures. | `'fullPage' \| 'viewport'` |
| disableTimersAndAnimations | When true, prevents JavaScript timers (setTimeout, setInterval, etc) and CSS animations from running while the screenshot is taken. Default is `false` | `boolean` |
| clip | Position and dimensions (in pixels) used to crop the final screenshot image. | `{ x: number; y: number; width: number; height: number;	}` |
| padding | Padding used to alter the dimensions of a screenshot of an element. It can either be a number, or an array of up to four numbers using CSS shorthand notation. This property is only applied for element screenshots and is ignored for all other types. | `number \| [ number ] \| [ number, number ] \| [ number, number, number ] \| [ number, number, number, number ]` |
| timeouts | Time to wait for .screenshot() to resolve before timing out. See [cypress timeouts options](https://docs.cypress.io/guides/references/configuration.html#Timeouts)  | `{ defaultCommandTimeout?: 4000, execTimeout?: 60000, taskTimeout?: 60000, pageLoadTimeout?: 60000, requestTimeout?: 5000, responseTimeout?: 30000;	}` |
| devicePixelRatio | The pixel ratio to use when taking screenshots. Default is `1` | `number` |
| failOnStatusCode | Whether Cypress should fail on a non-2xx response code from your server. Default is `true` | `boolean` |

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
| failureThreshold | Sets the threshold that would trigger a test failure based on the failureThresholdType selected. This is different to the customDiffConfig.threshold above - the customDiffConfig.threshold is the per pixel failure threshold, whereas this is the failure threshold for the entire comparison, i.e. the percentage of pixels which may be different to the baseline before the new snapshot is considered diffing. | `number` |
| failureThresholdType | Sets the type of threshold that would trigger a failure. | `'pixel' \| 'percent'` |
| blur | Applies Gaussian Blur on compared images, accepts radius in pixels as value. Useful when you have noise after scaling images per different resolutions on your target website, usually setting its value to 1-2 should be enough to solve that problem. | `number` |



<br>

# Notes
- If you only have one test suite it will be selected automatically.
- Green checks in the UI indicate that the test ran successfully, not that no diffs were detected. Diffs will be opened for preview at the end of the test run.
- High-resolution, high pixel ratio, long pages take more time and resources to process. Consider lowering the viewport or devicePixelRatio, or increasing the timeouts in the `visreg.config` file if you're timing out.
- SSIM comparison requires more memory than pixelmatch, so if you're running into memory issues, try using pixelmatch instead (which is the default).
- Logging: use cy.log() to log to the console. This will be displayed in the terminal when running the tests. Typescript will complain if you're passing an object and not a string, but you can cast it to "any" to get around that.
- Does not work on Windows (yet).
- This module will create, move, and delete files and directories in your test suite directories. It will not touch any files outside of the test suite directories.
- When taking snapshots in lab mode, if you have the dev tools panel open in the Cypress GUI, the snapshots will be cropped by that portion of the screen. Simply close the dev tools panel before taking a snapshot to avoid this.
- Blackout settings only affect the resulting snapshot - you will not see the blacked out elements in the Cypress GUI when running in lab mode.
- If your snapshots have repeated or omitted "lines", where the image has duplicated parts of it or it hasn't captured parts of the page, this could be due to a sticky element (typically a sticky header). Set its display to none before taking the snapshot, e.g. `cy.get('.sticky-element').invoke('css', 'display', 'none')` - making it transparent is not enough. You might also be able to set it to `position: fixed`. This is an issue [with Cypress](https://github.com/cypress-io/cypress/issues/2681).
- Changes not being detected?
  - If you're trying to detect subtle hue changes, e.g. a button changing from a light blue to a lighter blue, you may need to decrease the `comparisonMethod.customDiffConfig.threshold`, which increases the sensitivity to change on a pixel basis. Setting it to 0 means that any difference whatsoever between the pixels will register as a diff. The default is 0.01, meaning if there's a 1% or less difference between the pixel in the comparison images then the pixel will not register as being different. A larger hue change would be needed to register as being different.
  - If a snapshot's dimensions is very large, say a full-page capture of a long page, and you have a small but significant portion of it diffing, this might fail to register as a diff. This is because the `failureThreshold` is calculated as a **percentage of the total pixels**. For example: a `failureThreshold` of 0.1 (10%) will detect a diff of 10 (or more) pixels in a 10x10 grid of 100 pixels, but these same diffing pixels would not register as a diff in a 10x100 (1000) pixels grid, where they would only make up 1% of the total pixels - a 100 pixel diff would be needed. In this example, if the `failureThresholdType` is `percentage` you could decrease the `failureThreshold` by a factor of 10, **or** set the `failureThresholdType` to `pixel` and the `failureThreshold` to 10.
  - Or set the `failureThresholdType` to `pixel` instead of `percent`, which means that the `failureThreshold` will be calculated as a **number of pixels** instead of a percentage of the total pixels.
- Errors:
  - `"The 'files' list in config file 'tsconfig.json' is empty"` means you're attempting to run tests written in typescript but haven't followed the instructions above to set up typescript support.
  - `RangeError: The value of "targetStart" is out of range. It must be >= 0.` means you're attempting to diff very large images, e.g. very long, full page screenshots. Try the above suggestions for reducing the size of the screenshots.

# Credits

`visreg-test` utilizes [Cypress](https://www.cypress.io/) and [cypress-image-snapshot](https://www.npmjs.com/package/@simonsmith/cypress-image-snapshot) for the heavy lifting and image diffing, encapsulating them in a simple API and automating the process of evaluating and approving changes.
