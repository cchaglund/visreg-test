import { Alert, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../../../components/ui/helper-styles';
import { OldTestResults } from '../../../../contexts/test-context';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import { HistoryTerminalWrapper } from '../terminal/history-terminal-wrapper';
import CollapsibleSection from '../../../../components/ui/collapsible-section';
import { useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import BiotechTwoToneIcon from '@mui/icons-material/BiotechTwoTone';
import { VisregSummary } from '../../../../components/results/visreg-summary';
import { SuccessfulChips } from '../../../../components/results/successful-chips';
import { FailedChips } from '../../../../components/results/failed-chips';
import { UnchangedList } from '../../../../components/results/unchanged-list';
import { TestDiffsList } from '../../../../components/results/test-diffs-list';
import { FailedList } from '../../../../components/results/failed-list';
import { SkippedList } from '../../../../components/results/skipped-list';
import { useTheme } from '@mui/material';

const s = x.create({
    resultsContainer: {
        padding: '1rem',
        width: '100%',
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
        width: '100%',
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

export const OldResults = (props: { runData: OldTestResults; }) => {
    const theme = useTheme();

    const [ open, setOpen ] = useState(false);
    const [ stateClass, setAnimClass ] = useState('');
    const [ hovering, setHovering ] = useState('');

    if (!props.runData.visregSummary) return null;
    
    const { visregSummary, terminalOutput, createdAt } = props.runData;
    const { cypressSummary } = visregSummary;

    const handleToggleClick = () => {
        setAnimClass(!open ? 'open' : 'closed')
        setOpen(!open);
        setHovering('');
    }

    return (
        <div 
            className={`old-results-section ${stateClass} ${hovering ? 'hovering' : ''} ${theme.palette.mode === 'dark' ? 'dark' : ''}`}
            onMouseEnter={() => !open && setHovering('hovering')}
            onMouseLeave={() => setHovering('')}
            onClick={() => !open ? handleToggleClick() : null}
        >
            <CollapsibleSection
                heading={
                    <div {...x.props(style.flex, style.alignCenter)}>
                        <Typography variant='h6' color='text.primary' mr={'0.25rem'} textTransform='capitalize'>
                            {`${props.runData.index}. ${visregSummary.programChoices.suite}`}
                        </Typography>

                        <Typography variant='h6' color='text.secondary' ml={'0.75rem'}>
                            {`${new Date(createdAt).toLocaleTimeString()}`}
                        </Typography>

                        <Tooltip title="Type of test" placement='top'>
                            <Chip icon={<BiotechTwoToneIcon />} sx={{ marginLeft: '1rem' }} label={
                                `"${visregSummary.testType}"`
                            } />
                        </Tooltip>
                    </div>
                }
                overflowContentX={true}
                parentState={open}
                parentToggle={handleToggleClick}
                duration={200}
                waitForExpandedToRender={true}
            >
                <div {...x.props(s.resultsContainer)}>
                    <div {...x.props(style.flexColumn, style.alignCenter, style.mb1)}>
                        {visregSummary.terminated && (
                            <Alert severity="error" sx={{ alignItems: 'center', marginBottom: '2rem' }}>
                                <Typography variant='h6'>
                                    Test terminated by user
                                </Typography>
                            </Alert>
                        )}

                        {visregSummary.testDiffList?.length === 0 && !cypressSummary.failing && (
                            <div {...x.props(style.flex, style.gap1, style.alignCenter, style.mb2)}>
                                <CheckCircleTwoToneIcon fontSize='medium' color='success' />
                                <Typography variant='h6' color='text.primary'>
                                    No differences found
                                </Typography>
                            </div>
                        )}
                    </div>

                    <div {...x.props(s.resultsSection)}>
                        <VisregSummary visregSummary={visregSummary} />
                        {visregSummary.testType === 'targetted' && (
                            <SuccessfulChips programChoices={visregSummary.programChoices} />
                        )}
                        <FailedChips failingEndpoints={visregSummary.endpointTestResults.failing} />
                    </div>

                    <HistoryTerminalWrapper terminalOutput={terminalOutput} />

                    <div {...x.props(s.resultsSection)}>
                        <UnchangedList unchanged={visregSummary.endpointTestResults.unchanged} />
                        <TestDiffsList testDiffList={visregSummary.testDiffList} />
                        <FailedList failingEndpoints={visregSummary.endpointTestResults.failing} />
                        <SkippedList skippedEndpoints={visregSummary.endpointTestResults.skipped} />
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};
