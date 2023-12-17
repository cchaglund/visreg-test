import { runTest } from './cypress/e2e/visual-regression-tests.cy';
import { RunTest, TestProps } from './types';

export const runVisreg: RunTest = (props: TestProps) => {
    runTest(props);
};

