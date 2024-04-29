import { Typography, Button } from '@mui/material';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../contexts/app-context';
import { SuiteContext } from './suite-page';
import x from '@stylexjs/stylex';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';

export type ImageListsData = {
    imageNames: string[];
    typeOfImage: string;
};

const s = x.create({
    fileList: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
    },
    listNoStyle: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
    },
});


const ImageList = () => {
    const { imageNames, typeOfImage } = useLoaderData() as ImageListsData;
    const { suiteName } = useContext(AppContext);
    const { selectedEndpoint, selectedViewport } = useContext(SuiteContext);
    const navigate = useNavigate();

    return (
        <div {...x.props(s.fileList)}>
            <Typography
                variant='h5'
                sx={{ textTransform: 'capitalize' }}
                color={'text.primary'}
                mb={2}
            >
                {typeOfImage}
            </Typography>

            {imageNames && typeOfImage && (
                <ul {...x.props(s.listNoStyle)}>
                    {imageNames
                        .filter(image => image.includes(selectedEndpoint) && image.includes(selectedViewport))
                        .map((image, index) => (
                            <li key={index}>
                                <Button
                                    onClick={() => navigate(`/suite/${suiteName}/images/${typeOfImage}/${image}`)}
                                    startIcon={<ImageTwoToneIcon />}
                                >
                                    {image}
                                </Button>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
};

export default ImageList;
