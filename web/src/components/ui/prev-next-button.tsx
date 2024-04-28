import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import x from '@stylexjs/stylex';
import { Link, Typography } from '@mui/material';

const s = x.create({
    prevNextBlock: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'center',
    },
    nextBlock: {
        flexDirection: 'row-reverse',
    },
    link: {
        flexBasis: '50%',
        flexGrow: 0,
        flexShrink: 1,
        width: '1px',
    },
    text: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    }
});

type PrevNextControlsProps = {
    title: string | null;
    direction: string;
    clickHandler: () => void;
};

export const PrevNextButton = (props: PrevNextControlsProps) => {
    const { title, direction, clickHandler } = props;

    const icon = direction === 'prev' ? <ArrowBackIcon /> : <ArrowForwardIcon />;

    return (
        <Link
            {...x.props(s.link)}
            component="button"
            onClick={clickHandler}
        >
            <div {...x.props(s.prevNextBlock, props.direction === 'next' && s.nextBlock)}>
                {icon}
                <Typography
                    {...x.props(s.text)}
                    variant="body1"
                >
                    {title}
                </Typography>
            </div>
        </Link>
    );
};
