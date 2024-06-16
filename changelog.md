6.1.2
- Dependencies are now thoroughly audited, fixed, and shrinkwrapped before publishing. This process ensures that all dependencies are up-to-date, secure, and stable at the time of publishing.
- When containers are installed, an automatic audit and fix process is triggered.
- The Cypress testing framework version is now locked to a specific version to avoid any compatibility surprises. Newer versions of Cypress will be tested and integrated into the test runner before being released.
- Function name renamed in some places it had been missed.

6.1.1
- Regression fix: Broke docker container for mac/linux users in 6.0.0. Fixed. Windows users must now pass in a flag to run the containerized version of the test runner.

6.1.0
- Xray mode!

6.0.0
- Breaking changes: The naming of the endpoint visit hooks have been renamed to `onBeforeVisit`, `onVisit`, and `onAfterVisit`. You can also define these globally in the `snaps.js/ts` file, and they will be called during each endpoint visit. Setting them on the endpoint object will replace the global ones, but the global ones will be passed as an argument to the endpoint functions, so you can call them if you want to run both.
- Added history page to show previous test run results.
- We don't remove the test results when you leave the "Run test" page anymore.
- When going to the Gallery from the results page, the endpoints and viewports relevant to the test are preselected.
- User correctly set inside the container (no longer root).
- Added various tooltips.

5.1.1
- Fixed bug that caused issues with lab mode snapshot storing.

5.1.0
- Added a requestOptions object to the endpoint and configuration objects, which can be used to set headers, user-agent, etc. for the request.
- User-agent will now be set to the appropriate device type if using a preset viewport. Can be overriden by the requestOptions object in the endpoint.

5.0.1
- Gallery no longer shows .DS_Store files
- UI fixes
- Fix for snaps being considered skipped
- Targetted test on dimmentions like "1920,1080" now works

5.0.0
- Breaking changes: Changes to a couple of flags: `--endpoint-title` is now `--endpoint-titles`, and `--viewport` is now `--viewports`, because you can now specify multiple endpoints and viewports in a single flag.
- Can now run tests in the web gui
- Ability to terminate assessments early
- Ability to resume assessments
- Ability to assess diffs individually
- Added the documentation to the web interface

4.0.8
- Web interfece: all files in suite config can now be opened as files
- Styling
  
4.0.3
- Fixed a bug with assessment of diffs in the web interface.
- Added the endpoint data to the image previewer in the web interface.

4.0.0
- Added a web interface for assessing diffs and viewing snapshots

3.1.0
- Added a "--targetted" test mode, which allows you to specify your tests - like you can with the other modes - but it will not remove the previous diffs (which a full-test does)

3.0.7
- Various bug fixes and improvements

3.0.0
- Added support for running the test runner in a containerized environment.
- You can now choose between a number of browsers to run the tests in: Chrome, Firefox, Edge, and Electron (the default). Only Electron is currently supported in the containerized version.
- Breaking changes:
  - You will need to move all your suites into a directory called "suites" in the root of your project. This is to make it easier to find the tests when running the containerized version of the test runner.
  - Flags have been slightly rewritten
  - Removed support for testDirectory option in the config file

2.7.0
- The endpoint functions now recieve two arguments, the cy object (same as before) and instead of the cypress object as the second one, the second one is now a context object with some more attributes (including the cypress object).
- Added an `excludeFromTest` option to the endpoint object, which can be used to exclude an endpoint from the test run. It receives the same arguments as the other endpoint functions, and should return a boolean. If it returns true, the endpoint will be excluded from the test run. This is useful if you want to exclude an endpoint based on some condition.

2.6.0
- Added `onBefore` and `onCleanup` functions to the Endpoint object, which can be used to run code before and after the endpoint is visited and snapshot is taken. This is useful for setting up the test environment (e.g. changing a setting in your CMS), or cleaning up after the test (e.g. resetting that change).

2.5.6
- Fixed long-standing bug where the snapshot would be "stitched" together incorrectly, showing duplicate "rows" in the image, due to the default scroll-behaviour of Cypress being "smooth". This was especially noticeable on pages with a sticky header. Now we set the scroll-behaviour to "auto" before taking the snapshot.
- Now using chrome for the headless test runner, instead of electron.

2.5.4
- Made it so that waitForNetworkIdle can be set to false by the user.

2.5.3
- More reliably await everything to load before taking a screenshot, fixing an issue where the page would not be fully loaded before the screenshot was taken, resulting in some snapshots being cut off at the bottom, or have other issues.

2.5.2
- Made it more reliably take screenshots all the way to the bottom of the page, and fixed a bug

2.5.0
- Support for having multiple visreg config files, one per suite (as well as the global one in the project root)
  
2.4.0
- Fixed an issue where snapshots taken on a high dpi screen would be twice as large as the viewport size. By default now the snapshots are taken at 1x resolution, but you can change this by setting the `devicePixelRatio` option in the config file.
- Added some more options to the config file, specifically intended for Linux users (imagePreviewProcess and disableAutoPreviewClose). See the README for more info.
- Added another screenshot option: failOnStatusCode. If you set this to false, the test will not fail if the endpoint returns a non-200 status code. This is useful if you want to take snapshots of error pages, for example.
- We now show the file size of the received image in the terminal.

2.3.0
- `npx visreg --scaffold` will create a scaffold for you to get started with.

2.1.6
- Allow for skipping snapshots all together.

2.1.5
- Now handles endpoints titles with spaces in them.

2.1.0
- "Lab mode" - utilize the Cypress GUI and develop your tests isolated from the rest of your snapshots
- Full typescript support
- Can pass flags in the command line to run specific tests (skipping UI)
- Enabled logging to the console
- Better default options
- Added scroll duration option
- Max viewport size option

2.0.0
- Breaking changes: cy object is no longer global - it is passed to onEndpointVisit and onPageVisit functions and must be explicitly accessed via the first argument
- For typescript: You no longer need to import/declare the "cy" object, it is passed to the onEndpointVisit and onPageVisit functions
- The second argument passed to onEndpointVisit and onPageVisit functions is the Cypress object, containing useful utilities  and info about the test being run.
- Added support for all the module config options to endpoints

1.10.0
- you no longer need to have the .cy extension on your test files
- better docs
- added support for the Cypress and imageSnapshotOptions
- better error handling
- support for ts files