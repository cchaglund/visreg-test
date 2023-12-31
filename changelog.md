2.1.5
- Now handles endpoints titles with spaces in them

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