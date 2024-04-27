import { Typography } from '@mui/material';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ResultsColumn } from './results-column';

export const TestsSkipped = () => {
    const { skippedEndpoints } = useContext(TestContext);

    if (skippedEndpoints.length === 0) return null;

    return (
        <ResultsColumn 
            heading={`Skipped (${skippedEndpoints.length})`} 
            // subheading='Due to user termination. Any previous diffs have been restored'
        >
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
