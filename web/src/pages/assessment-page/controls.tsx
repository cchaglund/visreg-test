import { Button, Grid } from '@mui/material';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
});

const Controls = ({ doAssessAction }: { doAssessAction: (arg: string) => void; }) => {

    return (
        <div {...stylex.props(styles.container)}>
            <Grid container item xs={6} justifyContent={'flex-end'} sx={{ p: 2 }}>
                <Button
                    variant='contained'
                    color='error'
                    size='large'
                    startIcon={<ThumbDownIcon />}
                    onClick={() => doAssessAction('reject')}
                >
                    Reject (Spacebar)
                </Button>
            </Grid>
            <Grid container item xs={6} justifyContent={'flex-start'} sx={{ p: 2 }}>
                <Button
                    variant='contained'
                    color='success'
                    size='large'
                    endIcon={<ThumbUpIcon />}
                    onClick={() => doAssessAction('approve')}
                >
                    Approve (Enter)
                </Button>
            </Grid>
        </div>
    );
};

export default Controls;
