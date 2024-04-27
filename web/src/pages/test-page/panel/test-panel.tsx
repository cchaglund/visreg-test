import { TestResults } from './results/test-results';
import x from '@stylexjs/stylex';
import { TerminalWrapper } from './terminal/terminal-wrapper';

const s = x.create({
    testrunPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
});


export const TestPanel = () => {
    return (
        <div {...x.props(s.testrunPanel)}>
            <TerminalWrapper />

            <TestResults />
        </div>
    );
};
