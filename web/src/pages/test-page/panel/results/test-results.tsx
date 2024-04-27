import { Alert, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../../../components/ui/helper-styles';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ViewportsAndEndpointsTested } from './viewports-and-endpoints-tested';
import { FailedViewportsAndEndpointsTested } from './failed-viewports-and-endpoints-tested';
import { TestSummary } from './test-summary';
import { SuggestedActions } from './suggested-actions';
import { TestFailures } from './tests-failed';
import { TestResultTotalDiffs } from './tests-total-diffs';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import { TestsSkipped } from './tests-skipped';
import { TestsWithoutDiffs } from './test-without-diffs';

const s = x.create({
    resultsContainer: {
        minHeight: '100vh',
        marginTop: '2rem',
        maxWidth: '1100px',
        margin: '0 auto',
    },
    marginBottom: {
        marginBottom: {
            default: '5rem',
            '@media (max-width: 1000px)': '3rem',
        },
    },
    resultsSection: {
        display: 'flex',
        columnGap: '6rem',
        rowGap: '3.5rem',
        flexWrap: 'wrap',
        '@media (max-width: 1200px)': {
            columnGap: '4rem',
        },
        '@media (max-width: 1000px)': {
            columnGap: '3rem',
        }
    },
});

export const TestResults = () => {
    const { 
        visregSummary,
        resultsRef,
        testStatus,
        cypressSummaryState,
    } = useContext(TestContext);

    if (!visregSummary || !cypressSummaryState) return null;

    return (
        <div {...x.props(s.resultsContainer)} ref={resultsRef}>
            <div {...x.props(style.flexColumn, style.alignCenter, style.mb1)}>
                <Typography
                    variant='h4'
                    color={'text.primary'}
                    marginBlock={'2rem'}
                >
                    Results
                </Typography>

                {testStatus === 'terminated' && (
                    <Alert severity="error" sx={{ alignItems: 'center', marginBottom: '2rem' }}>
                        <Typography variant='h6'>
                            Test terminated by user
                        </Typography>
                    </Alert>
                )}

                {visregSummary.testDiffList?.length === 0 && !cypressSummaryState.failing && (
                    <div {...x.props(style.flex, style.gap1, style.alignCenter, style.mb2)}>
                        <CheckCircleTwoToneIcon fontSize='medium' color='success' />
                        <Typography variant='h6' color='text.primary'>
                            No differences found
                        </Typography>
                    </div>
                )}
            </div>

            <div {...x.props(s.resultsSection, s.marginBottom)}>
                <TestSummary/>
                {visregSummary.testType === 'targetted' && (
                    <ViewportsAndEndpointsTested/>
                )}
                <FailedViewportsAndEndpointsTested/>
                <SuggestedActions/>
            </div>

            <div {...x.props(s.resultsSection)}>
                <TestsWithoutDiffs/>
                <TestResultTotalDiffs/>
                <TestFailures/>
                <TestsSkipped />
            </div>
        </div>
    );
};
