import { Typography } from '@mui/material';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ResultsColumn } from './results-column';

export const UnchangedList = () => {
    const { visregSummary } = useContext(TestContext);

    if (visregSummary?.endpointTestResults.unchanged.length === 0) return null;

    return (
        <ResultsColumn heading={`Unchanged (${visregSummary?.endpointTestResults.unchanged.length})`}>
            {visregSummary?.endpointTestResults.unchanged.map((endpoint, index) => (
                <div key={index}>
                    <Typography variant='body1' color={'text.primary'}>
                        {endpoint.testTitle}
                    </Typography>
                </div>
            ))}
        </ResultsColumn>
    );
};
