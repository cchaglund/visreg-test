import { Typography } from '@mui/material';
import { EndpointTestResult } from '../../contexts/test-context';
import { ResultsColumn } from './results-column';

export const UnchangedList = (props: { unchanged: EndpointTestResult[]}) => {
    const { unchanged } = props;

    if (unchanged.length === 0) return null;

    return (
        <ResultsColumn heading={`Unchanged (${unchanged.length})`}>
            {unchanged.map((endpoint, index) => (
                <div key={index}>
                    <Typography variant='body1' color={'text.primary'}>
                        {endpoint.testTitle}
                    </Typography>
                </div>
            ))}
        </ResultsColumn>
    );
};
