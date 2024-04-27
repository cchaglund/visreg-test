import { Typography } from '@mui/material';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ResultsColumn } from './results-column';

export const TestDiffsList = () => {
    const { visregSummary } = useContext(TestContext);

    if (!visregSummary?.testDiffList.length) return null;

    return (
        <ResultsColumn heading={`Diffs (${visregSummary.testDiffList.length})`}>
            {visregSummary?.testDiffList.map((diff, index) => (
                <div key={index}>
                    <Typography variant='body1' color={'text.primary'}>
                        {diff.replace('.diff.png', '')}
                    </Typography>
                </div>
            ))}
        </ResultsColumn>
    );
};
