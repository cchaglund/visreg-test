import { useLoaderData, useNavigate } from 'react-router-dom';
import { SuiteContext } from './suite-page';
import { useContext } from 'react';
import { Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import EndpointsList from './endpoint-list';
import stylex from '@stylexjs/stylex';

const s = stylex.create({
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        marginBottom: '2rem',
    },
    actions: {
        padding: '2rem',
        width: '100%',
        display: 'flex',
        gap: '3rem',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewportSection: {
        marginBottom: '2rem',
    },
    viewportsContainer: {
        display: 'flex',
        columnGap: '0.5rem',
    },
    card: { 
        width: 170,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    comingSoon: {
        flexDirection: 'column',
        color: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        cursor: 'default',
    }
});

export type SuitePageData = {
    suiteSlug: string;
    fileNames: string[];
    typeOfFiles: string;
};

const SuiteHome = () => {
    const { suiteConfig, parsedViewports } = useContext(SuiteContext);
    const { suiteSlug } = useLoaderData() as SuitePageData;
    const navigate = useNavigate();
    

    return (
        <div>
            <div {...stylex.props(s.header)}>
                <Typography variant="h4" mb={0} sx={{ textTransform: 'capitalize'}}>
                    {suiteSlug}
                </Typography>
                <div>
                    <Typography variant='body2' component={'span'} mr={0.5}>
                        Baseurl: 
                    </Typography>
                    <Chip label={suiteConfig?.baseUrl}></Chip>
                </div>
            </div>

            <div {...stylex.props(s.actions)}>
                <Card elevation={0}>
                    {/* <CardActionArea onClick={() => console.log('hej!')}> */}
                        <CardContent {...stylex.props(s.card, s.comingSoon)}>
                            <Typography gutterBottom variant="h5" component="div">
                                Run test
                            </Typography>
                            <Typography variant="body1" component="div">
                                (Coming soon)
                            </Typography>
                        </CardContent>
                    {/* </CardActionArea> */}
                </Card>

                <Card elevation={3}>
                    <CardActionArea onClick={() => navigate(`/suite/${suiteSlug}/files`)}>
                        <CardContent {...stylex.props(s.card)}>
                            <Typography gutterBottom variant="h5" component="div">
                                View images
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </div>

            <div {...stylex.props(s.viewportSection)}>
                <Typography variant="h6" mb={1}>
                    Viewports
                </Typography>
                <div {...stylex.props(s.viewportsContainer)}>
                    {parsedViewports?.map((viewport, index) => (
                        <Chip key={index} label={viewport}></Chip>
                    ))}
                </div>
            </div>

            <EndpointsList endpoints={suiteConfig?.endpoints} />
        </div>
    );
};

export default SuiteHome;