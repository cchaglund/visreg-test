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