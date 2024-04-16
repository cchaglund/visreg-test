import { TerminalWrapper } from '../../components/terminal/terminal-wrapper';
import { TestResults } from './test-results';
import x from '@stylexjs/stylex';

const s = x.create({
    testrunPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
});


export const TestRunPanel = () => {
    return (
        <div {...x.props(s.testrunPanel)}>
            <TerminalWrapper />

            <TestResults />
        </div>
    );
};