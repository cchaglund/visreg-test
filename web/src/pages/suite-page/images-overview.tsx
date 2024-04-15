import { Button, Link, List, Typography } from '@mui/material';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import stylex from '@stylexjs/stylex';
import { SuiteContext } from './suite-page';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';

export type ImagesOverviewData = {
    imagesList: {
        baselineList: string[];
        diffList: string[];
        receivedList: string[];
    },
    suiteSlug: string;
};

const s = stylex.create({
    filesOverview: {
        width: '100%',
        display: 'flex',
        gap: '4rem',
        flexWrap: 'wrap',
    },
});

const ImagesOverview = () => {
    const { imagesList, suiteSlug } = useLoaderData() as ImagesOverviewData;
    const { selectedEndpoint, selectedViewport } = useContext(SuiteContext);
    const navigate = useNavigate();

    const ListOfImageLinks = (list: string[], type: string) => (
        <div>
            <Link color={'text.primary'} component={'button'} onClick={() => navigate(`/suite/${suiteSlug}/images/${type}`)}>
                <Typography
                    variant='h5'
                    sx={{ textTransform: 'capitalize' }}
                    mb={1}
                >
                    {type}
                </Typography>
            </Link>
            <List>
                {list
                    .filter(image => image.includes(selectedEndpoint) && image.includes(selectedViewport))
                    .map((image, index) => (
                        <Button
                            key={index}
                            onClick={() => navigate(`/suite/${suiteSlug}/images/${type}/${image}`)}
                            startIcon={<ImageTwoToneIcon />}
                            sx={{ display: 'flex', whiteSpace: 'nowrap' }}
                        >
                            {image}
                        </Button>
                    ))}
            </List>
        </div>
    );

    return (
        <div {...stylex.props(s.filesOverview)}>
            {ListOfImageLinks(imagesList.baselineList, 'baseline')}
            {ListOfImageLinks(imagesList.diffList, 'diff')}
            {ListOfImageLinks(imagesList.receivedList, 'received')}
        </div>
    );
};

export default ImagesOverview;
