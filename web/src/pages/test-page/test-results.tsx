import { Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../components/ui/helper-styles';
import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';
import { ViewportsAndEndpointsTested } from './viewports-and-endpoints-tested';
import { TestSummary } from './test-summary';
import { SuggestedActions } from './suggested-actions';
import { TestFailures } from './test-failures';

const s = x.create({
    resultsSection: {
        minHeight: '100vh',
        marginTop: '2rem',
    },
});

export const TestResults = () => {
    const { 
        summary,
        resultsRef,
    } = useContext(TestContext);

    if (!summary) return null;

    return (
        <div {...x.props(s.resultsSection)} ref={resultsRef}>
            <div {...x.props(style.flexColumn, style.alignCenter, style.mb1)}>
                <Typography
                    variant='h4'
                    color={'text.primary'}
                    marginBlock={'2rem'}
                >
                    Results
                </Typography>
            </div>

            <div {...x.props(style.flex, style.justifyCenter, style.gap7)}>
                <TestSummary/>
                <ViewportsAndEndpointsTested/>
                <SuggestedActions/>
            </div>

            <TestFailures/>
        </div>
    );
};
