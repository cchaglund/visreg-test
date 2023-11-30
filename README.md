# Visual regression testing suite

## Instructions

1. Install dependencies: `npm install`
2. Give execute permissions to the script: chmod +x visreg.sh
3. Run the script: `./visreg.sh` and follow the instructions
4. Add suite folder(s) to `cypress/e2e` directory
5. Run with the Cypress GUI by adding the gui flag: `./visreg.sh --gui` (in this mode, the script will not prompt you to accept or reject the new baseline for each diff)

The script will use cypress to generate snapshots of the different **suites**, located in cypress/e2e (use the _example_ folder as a reference):

- **endpoints.ts** contains the list of endpoints to test, including elements to black out (optional)
- **viewport.ts** contains the list of viewports to test
- **snaps.cy.ts** contains the cypress code to generate the snapshots

There are 3 **types** of test:

- **Full suite:** run all the tests and generate a new baseline
- **Retest diffs:** run only the tests which failed in the last run
- **Assess diffs**: assess the existing diffs (no tests are run)

After running the tests, the script will prompt you to accept or reject the new baseline for each diff. In detail:

- Locate and iterate through all .diff.png files in DIFF_DIR.
- Open each image for preview and prompt the user to decide whether to set it as a new baseline.
- If the user accepts, the script will replace the existing baseline image with the received image and delete the diff file.
- If the user rejects, the script will move on to the next file.
- Continue this process until all files are assessed.


### Important Notes
Does not work on Windows.
Ensure that you have the necessary permissions to read, write, and execute in the directories and with the files you are manipulating.
This script does not handle edge cases like file name conflicts beyond the basic replacement. If you need more robust handling, additional checks and features can be added.
