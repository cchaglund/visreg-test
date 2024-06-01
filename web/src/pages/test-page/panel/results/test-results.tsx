import { Alert, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../../../components/ui/helper-styles';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { SuggestedActions } from './suggested-actions';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import { VisregSummary } from '../../../../components/results/visreg-summary';
import { SuccessfulChips } from '../../../../components/results/successful-chips';
import { FailedChips } from '../../../../components/results/failed-chips';
import { UnchangedList } from '../../../../components/results/unchanged-list';
import { TestDiffsList } from '../../../../components/results/test-diffs-list';
import { FailedList } from '../../../../components/results/failed-list';
import { SkippedList } from '../../../../components/results/skipped-list';

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
    } = useContext(TestContext);

    if (!visregSummary) return null;

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

                {visregSummary.testDiffList?.length === 0 && !visregSummary.cypressSummary.failing && (
                    <div {...x.props(style.flex, style.gap1, style.alignCenter, style.mb2)}>
                        <CheckCircleTwoToneIcon fontSize='medium' color='success' />
                        <Typography variant='h6' color='text.primary'>
                            No differences found
                        </Typography>
                    </div>
                )}
            </div>

            <div {...x.props(s.resultsSection, s.marginBottom)}>
                <VisregSummary visregSummary={visregSummary} />
                {visregSummary.testType === 'targetted' && (
                    <SuccessfulChips programChoices={visregSummary.programChoices} />
                )}
                <FailedChips failingEndpoints={visregSummary.endpointTestResults.failing} />
                <SuggestedActions/>
            </div>

            <div {...x.props(s.resultsSection)}>
                <UnchangedList unchanged={visregSummary.endpointTestResults.unchanged}/>
                <TestDiffsList testDiffList={visregSummary.testDiffList}/>
                <FailedList failingEndpoints={visregSummary.endpointTestResults.failing}/>
                <SkippedList skippedEndpoints={visregSummary.endpointTestResults.skipped}/>
            </div>
        </div>
    );
};
