#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const readline = require("readline");
const shared_1 = require("./shared");
// console.log('TEST 3');
// // print the working directory so I know where the script is running from:
// console.log('CWD', process.cwd());
const projectDir = process.cwd();
process.env.PROJECT_DIR = projectDir;
console.log('projectDir', projectDir);
let clean_target_name = "";
let approvedFiles = [];
let rejectedFiles = [];
let diffFiles = [];
const SUITE_SNAPS_DIR = () => path.join(projectDir, clean_target_name, 'snapshots', 'snaps'); // TODO: snaps is the name of the test file, improvement could be to make it dynamic and allow for multiple test files
console.log('SUITE_SNAPS_DIR()', SUITE_SNAPS_DIR());
const DIFF_DIR = () => path.join(SUITE_SNAPS_DIR(), '__diff_output__');
const RECEIVED_DIR = () => path.join(SUITE_SNAPS_DIR(), '__received_output__');
const typesList = [
    {
        name: 'Full',
        slug: 'test-all',
        description: 'Run a full visual regression test of all endpoints and viewports (previous diffs are deleted)'
    },
    {
        name: 'Retest diffs only',
        slug: 'retest-diffs-only',
        description: 'Run only the tests which failed in the last run'
    },
    {
        name: 'Assess diffs',
        slug: 'assess-existing-diffs',
        description: 'Assess the existing diffs (no tests are run)'
    }
];
// Function to print color text
const printColorText = (text, colorCode) => {
    console.log(`\x1b[${colorCode}m${text}\x1b[0m`);
};
// Print header
printColorText('\n _  _  __  ____  ____  ____  ___ \n/ )( \\(  )/ ___)(  _ \\(  __)/ __)\n\\ \\/ / )( \\___ \\ )   / ) _)( (_ \\ \n \\__/ (__)(____/(__\\_)(____)\\___/\n', '36;1');
// Main function
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const selectedTargetName = yield selectTarget();
    clean_target_name = selectedTargetName;
    const { slug: testTypeSlug } = yield selectType();
    if (testTypeSlug === 'test-all') {
        fullRegressionTest(selectedTargetName, testTypeSlug);
    }
    if (testTypeSlug === 'retest-diffs-only') {
        diffsOnly(selectedTargetName, testTypeSlug);
    }
    if (testTypeSlug === 'assess-existing-diffs') {
        assessExistingDiffs();
    }
});
// Function to get directories in the suites directory
const getDirectories = (source) => fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => {
    console.log('dirent', dirent);
    return dirent.isDirectory();
})
    .map(dirent => dirent.name);
const targets = getDirectories(projectDir)
    .filter(dirName => dirName !== 'suites')
    .filter(dirName => dirName !== 'node_modules')
    .filter(dirName => dirName !== '._this_folder_is_not_used_but_is_needed_for_cypress_to_work');
const selectTarget = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('targets: ', targets);
    if (targets.length === 0) {
        printColorText('No test targets found - see README', '31');
        process.exit(1);
    }
    let selectedTargetName = "";
    if (targets.length === 1) {
        selectedTargetName = targets[0];
    }
    else {
        console.log('Select target:\n');
        targets.forEach((target, index) => {
            console.log(`${index + 1} ${target}`);
        });
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        selectedTargetName = yield new Promise((resolve) => {
            rl.question('\nEnter the number of the target you want to select: ', (targetNum) => {
                resolve(targets[parseInt(targetNum) - 1]);
            });
        });
        rl.close();
    }
    return selectedTargetName;
});
const selectType = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Select type:\n');
    typesList.forEach((type, index) => {
        console.log(`${index + 1} ${type.name} - ${type.description}`);
    });
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const selectedTest = yield new Promise((resolve) => {
        rl.question('\nEnter the number of the type you want to select: ', (id) => {
            resolve(typesList[parseInt(id) - 1]);
        });
    });
    rl.close();
    return selectedTest;
});
const runCypressTest = (target, type, diffListString) => __awaiter(void 0, void 0, void 0, function* () {
    printColorText(`\nStarting Cypress\n`, '2');
    return new Promise((resolve, reject) => {
        const specPath = path.join(projectDir, target, 'snaps.cy.js');
        console.log('--------specPath', specPath);
        const gui = process.argv.includes('--gui');
        let encodedDiff = '';
        if (diffListString) {
            encodedDiff = Buffer.from(diffListString).toString('base64');
        }
        const envs = [
            `testType=${type}`,
            'failOnSnapshotDiff=false',
            `target=${target}`,
            `diffListString=${diffListString ? encodedDiff : 'false'}`,
            `projectDir=${projectDir}`
        ];
        let cypressCommand;
        if (gui) {
            printColorText('Running in GUI mode - Assessment of eventual diffs must be done manually', '2');
            cypressCommand = `npx cypress open --env ${envs.join(',')}`;
        }
        else {
            process.chdir(__dirname); // __dirname is the directory where the current file is located
            // cypressCommand = `npx cypress run --spec "${specPath}" --env ${envs.join(',')} --config-file dist/cypress.config.js`; // when run as a local script
            // cypressCommand = `../node_modules/.bin/cypress run --spec "${specPath}" --env ${envs.join(',')} `; // when run as a locally-installed module
            cypressCommand = `npx cypress run --spec "${specPath}" --env ${envs.join(',')} `; // when run as a locally-installed module
        }
        console.log('cypressCommand', cypressCommand);
        const parts = cypressCommand.split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        const child = (0, child_process_1.spawn)(`DEBUG=cypress ${command}`, args, { shell: true, stdio: 'inherit' });
        child.on('data', (data) => {
            console.log(`${data}`);
        });
        child.on('data', (data) => {
            // console.error(`${data}`);
        });
        child.on('error', (error) => {
            // console.error(`exec error: ${error}`);
        });
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`child process exited with code ${code}`));
            }
            else {
                resolve();
            }
        });
    });
});
const exitIfNoDIffs = () => {
    if (!fs.existsSync(DIFF_DIR()) || fs.readdirSync(DIFF_DIR()).length === 0) {
        printColorText('🎉  Visual regression passed! (No diffs found)', '32');
        process.exit();
    }
};
const fullRegressionTest = (selectedTargetName, testTypeSlug) => __awaiter(void 0, void 0, void 0, function* () {
    remove_diffs();
    remove_received();
    yield runCypressTest(selectedTargetName, testTypeSlug);
    assessExistingDiffImages();
});
const diffsOnly = (selectedTargetName, testTypeSlug) => __awaiter(void 0, void 0, void 0, function* () {
    exitIfNoDIffs();
    const diffListString = createTemporaryDiffList();
    remove_diffs();
    remove_received();
    yield runCypressTest(selectedTargetName, testTypeSlug, diffListString);
    assessExistingDiffImages();
});
const assessExistingDiffs = () => {
    assessExistingDiffImages();
};
const remove_diffs = () => {
    var _a;
    const dir = DIFF_DIR();
    if (fs.existsSync(dir) && ((_a = fs.readdirSync(dir)) === null || _a === void 0 ? void 0 : _a.length)) {
        fs.rm(dir, { recursive: true }, (err) => { console.log(err); });
    }
};
const remove_received = () => {
    const dir = RECEIVED_DIR();
    if (fs.existsSync(dir) && fs.readdirSync(dir).length) {
        fs.rm(dir, { recursive: true }, (err) => { console.log(err); });
    }
};
const createTemporaryDiffList = () => {
    if (!fs.existsSync(DIFF_DIR())) {
        return '';
    }
    diffFiles = fs.readdirSync(DIFF_DIR()).filter(file => file.endsWith('.diff.png'));
    return diffFiles.join(shared_1.delimiter);
};
const openImage = (imageFile) => {
    if (process.platform === 'darwin') {
        (0, child_process_1.execSync)(`open -g "${path.join(DIFF_DIR(), imageFile)}"`);
    }
    else {
        (0, child_process_1.execSync)(`xdg-open "${path.join(DIFF_DIR(), imageFile)}"`);
    }
};
const processImage = (imageFile) => __awaiter(void 0, void 0, void 0, function* () {
    const imageName = imageFile.replace('.diff.png', '');
    printColorText('\n' + imageName, '4');
    openImage(imageFile);
    const rl = readline.createInterface({
        input: process.stdin,
    });
    while (true) {
        const answer = yield new Promise(resolve => {
            // Enable raw mode to get individual keypresses
            readline.emitKeypressEvents(process.stdin);
            if (process.stdin.isTTY)
                process.stdin.setRawMode(true);
            // Listen for keypress event
            process.stdin.on('keypress', (str, key) => {
                if (key.name === 'r') {
                    resolve('reopen');
                    process.stdin.removeAllListeners('keypress');
                }
                else if (key.name === 'space') {
                    resolve('reject');
                    process.stdin.removeAllListeners('keypress');
                }
                else if (key.name === 'return') {
                    resolve('approve');
                    process.stdin.removeAllListeners('keypress');
                }
            });
            console.log(`\x1b[2mENTER to approve, SPACEBAR to reject, R to reopen image \x1b[0m`);
        });
        if (process.platform === 'linux') {
            (0, child_process_1.execSync)(`pkill -f "${path.join(DIFF_DIR(), imageFile)}"`);
        }
        if (answer === 'approve') {
            approvedFiles.push(imageName);
            printColorText('✅  Approved changes\x1b[2m - updating baseline\x1b[0m', '32');
            const baselineName = `${imageName}.base.png`;
            const receivedName = `${imageName}-received.png`;
            fs.unlinkSync(path.join(SUITE_SNAPS_DIR(), baselineName));
            fs.renameSync(path.join(RECEIVED_DIR(), receivedName), path.join(SUITE_SNAPS_DIR(), baselineName));
            fs.unlinkSync(path.join(DIFF_DIR(), imageFile));
            break;
        }
        else if (answer === 'reopen') {
            openImage(imageFile);
        }
        else if (answer === 'reject') {
            rejectedFiles.push(imageName);
            printColorText('Rejected changes\x1b[2m - run test again after fixing\x1b[0m', '33');
            break;
        }
    }
    rl.close();
    console.log('\n');
});
const assessExistingDiffImages = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n\n');
    exitIfNoDIffs();
    printColorText('🚨  Detected differences, opening preview \x1b[2m- takes a couple of seconds\x1b[0m\n\n', '31');
    const files = fs.readdirSync(DIFF_DIR()).filter(file => file.endsWith('.diff.png'));
    for (const file of files) {
        yield processImage(file);
    }
    if (process.platform === 'darwin') {
        (0, child_process_1.execSync)(`osascript -e 'quit app "Preview"'`);
    }
    printColorText('Done!\n\n', '1');
    if (approvedFiles.length > 0) {
        printColorText('\nApproved:', '2');
        for (const file of approvedFiles) {
            printColorText(file, '32');
        }
    }
    if (rejectedFiles.length > 0) {
        printColorText('\nRejected:', '2');
        for (const file of rejectedFiles) {
            printColorText(file, '31');
        }
    }
    printColorText(`\nTotal files: ${approvedFiles.length + rejectedFiles.length}`, '2');
    printColorText(`Total approved: ${approvedFiles.length}`, '32');
    printColorText(`Total rejected: ${rejectedFiles.length}`, '31');
    if (rejectedFiles.length > 0) {
        printColorText('\n\n⚠️  You rejected some changes - \x1b[2mrun this test again after making the necessary fixes in order to update the baseline images.\x1b[0m', '33');
    }
});
process.on('SIGINT', () => {
    process.stdin.removeAllListeners('keypress');
    process.exit();
});
main();
