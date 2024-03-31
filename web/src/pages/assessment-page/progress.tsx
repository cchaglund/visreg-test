import { Grid, LinearProgress, Typography } from '@mui/material';
import { DiffFilesType } from './types';

type ProgressProps = {
    currentDiffIndex: number | null;
    diffFiles?: DiffFilesType;
};

const Progress = ({ currentDiffIndex, diffFiles }: ProgressProps) => {

    if (currentDiffIndex === null || !diffFiles) return null;

    return (
        <Grid container justifyContent={'space-between'} wrap='nowrap'>
            <Grid item sx={{ p: 2, width: '100%' }}>
                <LinearProgress
                    sx={{ marginBlock: 2 }}
                    variant="determinate"
                    value={(currentDiffIndex + 1) / (diffFiles ? diffFiles.length : 0) * 100}
                />
            </Grid>
            <Grid item sx={{ paddingBlock: 2, flexGrow: 1 }}>
                <Typography color='text.primary' variant='h6' sx={{ whiteSpace: 'nowrap' }}>
                    {`${currentDiffIndex + 1} / ${diffFiles.length}`}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default Progress;
