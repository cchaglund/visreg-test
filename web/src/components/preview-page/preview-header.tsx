import { Chip, Link, Typography } from '@mui/material';
import stylex from '@stylexjs/stylex';
import { Image } from './types.d';

const s = stylex.create({
    chipContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        marginInline: '2rem',
        marginBlock: '0.5rem',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    flex: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: 'fit-content',
        margin: '0 auto',
    },
});

const PreviewHeader = (props: { image: Image; }) => {
    const { image } = props;

    const typeColor = () => {
        switch (image.type) {
            case 'baseline':
                return 'success';
            case 'diff':
                return 'error';
            case 'received':
                return 'warning';
            default:
                return 'default';
        }
    };

    if (!image) {
        return null;
    }

    return (
        <div {...stylex.props(s.flex)}>
            <Typography color='text.primary' variant='h4' sx={{ textAlign: 'center', mb: 1, width: '100%' }}>
                {image.fileName}
            </Typography>
            <Typography color='text.secondary' variant='h6' sx={{ textAlign: 'center', mb: 1, width: '100%' }}>
                <Link href={image.fullUrl} target='_blank' rel='noreferrer'>
                    {image.fullUrl}
                </Link>
            </Typography>
            <div {...stylex.props(s.chipContainer)}>
                <Chip
                    label={image.type}
                    variant="filled"
                    color={typeColor()}
                    sx={{ textTransform: 'capitalize' }}
                />
                <Chip
                    label={image.sizeString}
                    variant="filled"
                />
                <Chip
                    label={`Created: ${new Date(image.createdAt).toLocaleDateString()}`}
                    variant="filled"
                />
                <Chip
                    label={`Modified: ${new Date(image.modifiedAt).toLocaleDateString()}`}
                    variant="filled"
                />
            </div>
        </div>
    );
};

export default PreviewHeader;
