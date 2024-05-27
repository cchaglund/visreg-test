import { Alert, Button, Link, List, Typography } from '@mui/material';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import stylex from '@stylexjs/stylex';
import { SuiteContext } from './suite-page';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';
import { style } from '../../components/ui/helper-styles';

export type ImagesOverviewData = {
    imagesList: {
        baselineList: string[];
        diffList: string[];
        receivedList: string[];
    },
    suiteSlug: string;
    gallerySubset: string[];
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
    const { imagesList, suiteSlug, gallerySubset } = useLoaderData() as ImagesOverviewData;
    const { selectedEndpoints, selectedViewports } = useContext(SuiteContext);
    const [ ignoreSubset, setIgnoreSubset ] = useState(false);
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
                    .filter(image => {
                        if (!gallerySubset || !gallerySubset.length || ignoreSubset) return true;
                        return gallerySubset.find(subset => image.includes(subset));
                    })
                    .filter(image => {
                        if (!selectedEndpoints.length) return true;
                        return selectedEndpoints.find(endpoint => image.includes(endpoint))
                    })
                    .filter(image => {
                        if (!selectedViewports.length) return true;
                        return selectedViewports.find(viewport => image.includes(viewport))
                    })
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
        <div {...stylex.props(style.width100)}>
            {gallerySubset && gallerySubset.length > 0 && !ignoreSubset && (
                <Alert severity="info" sx={{ mb: 5 }}>
                    <div {...stylex.props(style.flex, style.gap1)}>
                        <Typography variant='body1'>
                            Displaying images which were included in the test run.
                        </Typography>
                        <Button 
                            onClick={() => setIgnoreSubset(true)}
                            color='secondary'
                            variant='outlined'
                            size='small'
                        >
                            Show all images
                        </Button>
                    </div>
                </Alert>
            )}

            <div {...stylex.props(s.filesOverview)}>
                {ListOfImageLinks(imagesList.baselineList, 'baseline')}
                {ListOfImageLinks(imagesList.diffList, 'diff')}
                {ListOfImageLinks(imagesList.receivedList, 'received')}
            </div>
        </div>
    );
};

export default ImagesOverview;
