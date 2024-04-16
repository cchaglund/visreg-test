import { Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { TestTypeActions } from './test-type-actions';
import { TestRunPanel } from './test-run-panel';

export type SummaryPayload = {
    failed: boolean;
    duration: number;
    diffList: string[];
};

const s = x.create({
    testPage: {
        width: '100%',
        margin: '0 auto',
        maxWidth: '1400px',
    },
    testSection: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        padding: '1rem',
        marginBottom: '1rem',
        gap: '1rem',
    },
    testNameContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
});


const TestPage = () => {

    return (
        <div {...x.props(s.testPage)}>

            <Typography
                color={'text.primary'}
                textAlign={'center'}
                variant='h4'
                mb={8}
            >
                Run tests
            </Typography>

            <div>
                <TestTypeActions />
                <TestRunPanel />
            </div>

        </div>
    );
};

export default TestPage;
