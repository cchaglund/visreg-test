import { Button, ButtonGroup } from '@mui/material';
import stylex from '@stylexjs/stylex';
import { Image } from './types.d';
import { useNavigate } from 'react-router-dom';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';
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
        marginBlock: '0.2rem',
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
    image: Image;
};

const InformationTable = ({ image }: InformationTableProps) => {
    const navigate = useNavigate();

    return (
        <div {...stylex.props(s.informationTable)}>
            <div {...stylex.props(s.imageButtonsContainer)}>
                <div {...stylex.props(s.imageButtonsStyle)}>
                    <RawFilePanel url={image.fileUrl} path={image.path} />
                </div>
            </div>

            <div {...stylex.props(s.imageButtonsContainer)}>
                <ButtonGroup variant="text" aria-label="Basic button group">
                    {image.siblingPaths
                        .filter(sibling => sibling.type !== image.type)
                        .map((sibling, index) => {
                            return (
                                <Button
                                    key={index}
                                    onClick={() => navigate(sibling.previewUrl)}
                                    variant='text'
                                    startIcon={<ImageTwoToneIcon />}
                                >
                                    {sibling.type}
                                </Button>
                            );
                        })
                    }
                </ButtonGroup>
            </div>
        </div>
    );
};

export default InformationTable;
