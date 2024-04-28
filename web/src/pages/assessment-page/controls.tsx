import { Button } from '@mui/material';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '2rem',
        width: '100%',
    },
});

const Controls = ({ doAssessAction }: { doAssessAction: (arg: string) => void; }) => {

    return (
        <div {...stylex.props(styles.container)}>

            <Button
                variant='contained'
                color='error'
                size='large'
                startIcon={<ThumbDownIcon />}
                onClick={() => doAssessAction('reject')}
            >
                Reject {/* (Spacebar) */}
            </Button>

            <Button
                variant='contained'
                color='success'
                size='large'
                startIcon={<ThumbUpIcon />}
                onClick={() => doAssessAction('approve')}
            >
                Approve {/* (Enter) */}
            </Button>

        </div>
    );
};

export default Controls;
