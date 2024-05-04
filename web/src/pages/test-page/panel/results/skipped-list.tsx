import { Typography } from '@mui/material';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ResultsColumn } from './results-column';

export const SkippedList = () => {
    const { skippedEndpoints } = useContext(TestContext);

    if (skippedEndpoints.length === 0) return null;

    return (
        <ResultsColumn heading={`Skipped (${skippedEndpoints.length})`}>
            {skippedEndpoints.map((skipped, index) => (
                <div key={index}>
                    <Typography variant='body1' color={'text.primary'}>
                        {skipped.testTitle}
                    </Typography>
                </div>
            ))}
        </ResultsColumn>
    );
};
