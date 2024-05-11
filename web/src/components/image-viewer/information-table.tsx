import { Button, ButtonGroup } from '@mui/material';
import stylex from '@stylexjs/stylex';
import { useNavigate } from 'react-router-dom';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';
import RawFilePanel from '../ui/raw-file';
import { Image } from '../../types';
import { useState } from 'react';

const s = stylex.create({
    imageButtonsStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        gap: '0.5rem',
        marginBottom: '1rem',
    },
});

type InformationTableProps = {
    image: Image;
};

const InformationTable = ({ image }: InformationTableProps) => {
    const navigate = useNavigate();
    const [ filteredSiblingPaths ] = useState(image.siblingPaths.filter(sibling => sibling.type !== image.type));

    return (
        <div {...stylex.props(s.informationTable)}>
            <div {...stylex.props(s.imageButtonsContainer)}>
                <div {...stylex.props(s.imageButtonsStyle)}>
                    <RawFilePanel url={image.fileUrl} path={image.path} />
                </div>
            </div>

            {filteredSiblingPaths.length > 0 && (
                <div {...stylex.props(s.imageButtonsContainer)}>
                    <ButtonGroup variant="text">
                        {image.siblingPaths
                            .filter(sibling => sibling.type !== image.type)
                            .map((sibling, index) => (
                                <Button
                                    key={index}
                                    onClick={() => navigate(sibling.previewUrl)}
                                    variant='text'
                                    startIcon={<ImageTwoToneIcon />}
                                >
                                    {sibling.type}
                                </Button>
                            ))
                        }
                    </ButtonGroup>
                </div>
            )}
        </div>
    );
};

export default InformationTable;
