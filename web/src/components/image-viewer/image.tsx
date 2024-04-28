import { Paper } from '@mui/material';
import * as stylex from '@stylexjs/stylex';
import { Image } from '../../types';

const imageStyles = stylex.create({
    shared: {
        width: 'auto',
        height: 'auto',
    },
    regular: {
        maxWidth: '100%',
        maxHeight: '80vh',
        '@media (max-width: 1100px)': {
            maxHeight: '45vh',
        },
    },
    zoomedIn: {
        maxHeight: 'auto',
        maxWidth: 'auto',
        // This is all here for css specificity reasons
        '@media (max-width: 1536px)': {
            maxHeight: 'auto'
        },
        '@media (min-width: 1536px)': {
            maxHeight: 'auto'
        },
        '@media (max-width: 1100px)': {
            maxHeight: 'auto',
        },
    },
});

const paperStyles = stylex.create({
    paperStyle: {
        cursor: 'zoom-in',
        backgroundColor: 'rgba(0,0,0,0.08)',
        width: 'fit-content',
        textAlign: 'center',
    },
    paperStyleZoomedIn: {
        overflow: 'scroll',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
});

type ImagePreviewProps = {
    zoomedIn: boolean;
    image: Image;
    hovering: boolean;
};

const ImageComponent = ({ zoomedIn, image, hovering }: ImagePreviewProps) => {
    return (
        <Paper
            elevation={hovering ? 16 : 6}
            sx={{ color: 'text.primary' }}
            {...stylex.props(
                paperStyles.paperStyle,
                zoomedIn && paperStyles.paperStyleZoomedIn,
            )}
        >
            <img
                {...stylex.props(
                    imageStyles.shared,
                    imageStyles.regular,
                    zoomedIn && imageStyles.zoomedIn,
                )}
                src={`${image.fileUrl}`}
                alt='ImageComponent'
                loading='lazy'
            />
        </Paper>
    );
};

export default ImageComponent;
