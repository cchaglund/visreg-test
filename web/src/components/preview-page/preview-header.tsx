import { Chip, Typography } from '@mui/material';
import stylex from '@stylexjs/stylex';
import { File } from './types.d';

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

const PreviewHeader = (props: { file: File}) => {
    const { file } = props;

    const typeColor = () => {
        switch (file.type) {
            case 'baseline':
                return 'success';
            case 'diff':
                return 'error';
            case 'received':
                return 'warning';
            default:
                return 'default';
        }
    }

    if (!file) {
        return null;
    }

    return (
        <div {...stylex.props(s.flex)}>
            <Typography color='text.primary' variant='h4' sx={{ textAlign: 'center', mb: 0, width: '100%' }}>
                {file.fileName}
            </Typography>
            <div {...stylex.props(s.chipContainer)}>
                <Chip 
                    label={file.type}
                    variant="filled"
                    color={typeColor()}
                    sx={{ textTransform: 'capitalize' }}
                />
                <Chip 
                    label={file.sizeString}
                    variant="filled"
                />
                <Chip 
                    label={`Created: ${new Date(file.createdAt).toLocaleDateString()}`}
                    variant="filled"
                />
                <Chip 
                    label={`Modified: ${new Date(file.modifiedAt).toLocaleDateString()}`}
                    variant="filled"
                />
            </div>
        </div>
    );
};

export default PreviewHeader;
