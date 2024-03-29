import { Divider, Link, Typography } from '@mui/material';
import stylex from '@stylexjs/stylex';
import { File } from './types.d';
import { useNavigate } from 'react-router-dom';
import { Check, Close, CallReceived, } from '@mui/icons-material';
import RawFilePanel from './raw-file';

const s = stylex.create({
    imageButtonsStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBlock: '0.4rem',
        textTransform: 'capitalize'
    },
    sansMarginBlock: {
        marginBlock: '0',
    },
    imageButtonsContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBlock: '0.4rem',
    },
    imageButtons: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    informationTable: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

type InformationTableProps = {
    file: File;
};

const InformationTable = ({ file }: InformationTableProps) => {
    const navigate = useNavigate();

    const ImageButtons = (props: { path: string, type: string; }) => {
        const baselineIcon = <Check sx={{ mr: 1 }} color="success" />;
        const diffIcon = <Close sx={{ mr: 1 }} color="error" />
        const receivedIcon = <CallReceived sx={{ mr: 1 }} color="warning" />

        let icon = null;
        switch (props.type) {
            case 'baseline':
                icon = baselineIcon;
                break;
            case 'diff':
                icon = diffIcon;
                break;
            case 'received':
                icon = receivedIcon;
                break;
            default:
                icon = null;
        }

        return (
            <Link
                {...stylex.props(s.imageButtonsStyle, s.sansMarginBlock)}
                onClick={() => navigate(props.path)}
                component={'button'}
            >
                {icon}
                {props.type}
            </Link>
        )
    }

    return (
        <div {...stylex.props(s.informationTable)}>

            <div {...stylex.props(s.imageButtonsContainer)}>
                <div {...stylex.props(s.imageButtonsStyle)}>
                    <RawFilePanel url={file.fileUrl} path={file.path} />
                </div>
            </div>

            <div {...stylex.props(s.imageButtonsContainer)}>
                {file?.siblingPaths?.filter(sibling => sibling.type !== file.type).length > 0 && (
                    <Typography variant='body2' sx={{ marginRight: '1rem', alignItems: 'center' }}>
                        Related images:
                    </Typography>
                )}
                {file.siblingPaths
                    .filter(sibling => sibling.type !== file.type)
                    .map((sibling, index) => {
                        return (
                            <div key={index} {...stylex.props(s.imageButtons)}>
                                <ImageButtons path={sibling.previewUrl} type={sibling.type} />
                                { index !== 1 && (
                                    <Divider orientation='vertical' flexItem sx={{marginInline: '1rem'}} /> 
                                )}
                            </div>
                        );
                    })
                }

            </div>
        </div>
    );
};

export default InformationTable;
