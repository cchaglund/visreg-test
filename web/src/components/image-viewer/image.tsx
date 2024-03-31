import { Paper } from '@mui/material';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Image } from '../../types';

const imageStyles = stylex.create({
    shared: {
        width: 'auto',
        height: 'auto',
    },
    regular: {
        maxWidth: '100%',
        maxHeight: '80vh',
        '@media (max-width: 1000px)': {
            maxHeight: '56vh',
        },
    },
    zoomedIn: {
        maxHeight: 'auto',
        maxWidth: 'auto',
        '@media (max-width: 1536px)': {
            maxHeight: 'auto'
        },
        '@media (min-width: 1536px)': {
            maxHeight: 'auto'
        },
    },
});

const paperStyles = stylex.create({
    paperStyle: {
        marginBottom: '1rem',
        cursor: 'zoom-in',
        backgroundColor: 'rgba(0,0,0,0.08)',
        width: 'fit-content',
        marginInline: 'auto',
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
    toggleZoom: () => void;
    zoomedIn: boolean;
    image: Image;
};

const ImageComponent = ({ toggleZoom, zoomedIn, image }: ImagePreviewProps) => {
    const [ imgElevation, setImgElevation ] = useState(4);

    return (
        <Paper
            onMouseEnter={() => setImgElevation(16)}
            onMouseLeave={() => setImgElevation(6)}
            onClick={() => toggleZoom()}
            elevation={imgElevation}
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
