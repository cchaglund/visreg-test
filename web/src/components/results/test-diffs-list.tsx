import { Typography } from '@mui/material';
import { ResultsColumn } from './results-column';

export const TestDiffsList = (props: { testDiffList: string[] }) => {
    const { testDiffList } = props;

    if (!testDiffList.length) return null;

    return (
        <ResultsColumn heading={`Diffs (${testDiffList.length})`}>
            {testDiffList.map((diff, index) => (
                <div key={index}>
                    <Typography variant='body1' color={'text.primary'}>
                        {diff.replace('.diff.png', '')}
                    </Typography>
                </div>
            ))}
        </ResultsColumn>
    );
};
