import { runTest } from './cypress/e2e/visual-regression-tests.cy';
import { RunTest, TestConfig } from './types';

export const runVisreg: RunTest = (props: TestConfig) => {
    runTest(props);
};

