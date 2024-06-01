import { OldResults } from './results/old-results';
import x from '@stylexjs/stylex';
import { useContext, useMemo, useState } from 'react';
import { OldTestResults, TestContext } from '../../../contexts/test-context';
import { ChipContainer } from '../../../components/ui/chips-container';
import { useLoaderData } from 'react-router-dom';
import { Button, Chip, Typography } from '@mui/material';
import { style } from '../../../components/ui/helper-styles';
import { TestConfig } from '../../../types';

const s = x.create({
    testrunPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginTop: '2rem',
        marginBottom: '4rem',
    },
});

type HistoryPanelData = {
    projectInformation: {
        suites: string[];
        version: string;
    };
    suiteConfig: TestConfig;
};

export const HistoryPanel = () => {
    const { history } = useContext(TestContext);
    const { projectInformation, suiteConfig } = useLoaderData() as HistoryPanelData;
    const [ selectedSuites, setSelectedSuites ] = useState<string[]>(suiteConfig.suiteSlug ? [suiteConfig.suiteSlug] : []);

    const addSelectedSuite = (name: string) => {
        setSelectedSuites(prev => {
            return prev.includes(name) 
                ? prev.filter(n => n !== name)
                : [ ...prev, name ]
        });
    }

    const sortedHistory = useMemo(() => {
        if (!history) return {};

        const filtered = history
            .filter(runData => {
                if (!selectedSuites.length) return true;
                return selectedSuites.includes(runData.visregSummary.programChoices.suite || '');
            })
            .reverse()

        const dateBuckets = filtered
            .reduce((acc, runData) => {
                const date = new Date(runData.createdAt).toDateString();
                if (!acc[date]) acc[date] = [];
                acc[date].push(runData);
                return acc;
            }, {} as Record<string, OldTestResults[]>)
            
        return dateBuckets
    }, [history, selectedSuites]);

    return (
        <div>
            <div {...x.props(style.mb4, style.flex, style.flexWrap, style.gap1, style.alignCenter )}>
                <Typography variant="body1" color="text.primary">
                    Suites:
                </Typography>
                <ChipContainer>
                    {projectInformation.suites.map((suiteName, index) => (
                        <Chip
                            key={index}
                            label={suiteName}
                            onClick={() => addSelectedSuite(suiteName)}
                            variant={selectedSuites.find(name => name === suiteName) ? 'filled' : 'outlined'}
                            clickable
                            color='secondary'
                        />
                    ))}
                    <Button variant='text' size='small' color='secondary' onClick={() => {
                        setSelectedSuites([]);
                    }}>
                        Clear filter
                    </Button>
                </ChipContainer>
            </div>

            {Object.keys(sortedHistory)?.map((date, index) => {
                return (
                    <div {...x.props(s.testrunPanel)} key={index}>
                        <Typography variant="h5" color="text.primary" mb={1}>
                            {date}
                        </Typography>
                        {sortedHistory[ date ]?.map((run, index) => (
                            <OldResults key={index} runData={run} />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
