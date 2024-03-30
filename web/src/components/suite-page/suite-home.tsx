import { useLoaderData, useNavigate } from 'react-router-dom';
import { SuiteContext } from './suite-page';
import { useContext } from 'react';
import { Button, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import EndpointsList from './endpoint-list';
import x from '@stylexjs/stylex';
import RawFilePanel from '../preview-page/raw-file';
import CollapsibleSection from './collapsible-section';
import FileOpenTwoToneIcon from '@mui/icons-material/FileOpenTwoTone';


const s = x.create({
    suiteHomeContainer: {
        width: '100%',
        marginBottom: '4rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '2rem',
        textTransform: 'capitalize',
    },
    actions: {
        padding: '2rem',
        display: 'flex',
        gap: '3rem',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    leftAreaSection: {
        marginBottom: '2rem',
    },
    flexContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
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
    },
    infoArea: {
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '3rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    endpointsSection: {
        flexGrow: 1,
    },
    leftArea: {
        width: '400px',
    },
    mt1: {
        marginTop: '1rem',
    },
    mt2: {
        marginTop: '2rem',
    },
    wrap: {
        flexWrap: 'wrap',
    },
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

    const InfoArea = (props: { children: React.ReactNode; }) => (
        <div {...x.props(s.infoArea)}>
            {props.children}
        </div>
    );

    const LeftArea = (props: { children: React.ReactNode; }) => (
        <div {...x.props(s.leftArea)}>
            {props.children}
        </div>
    );

    return (
        <div {...x.props(s.suiteHomeContainer)}>
            <div {...x.props(s.header)}>
                <Typography variant="h4" mb={0} color='text.primary'>
                    {suiteSlug}
                </Typography>
            </div>

            <div {...x.props(s.actions)}>
                <Card elevation={0}>
                    {/* <CardActionArea onClick={() => console.log('hej!')}> */}
                    <CardContent {...x.props(s.card, s.comingSoon)}>
                        <Typography gutterBottom variant="h5" color='text.primary'>
                            Run test
                        </Typography>
                        <Typography variant="body1" color='text.primary'>
                            (Coming soon)
                        </Typography>
                    </CardContent>
                    {/* </CardActionArea> */}
                </Card>

                <Card>
                    <CardActionArea onClick={() => navigate(`/suite/${suiteSlug}/images`)}>
                        <CardContent {...x.props(s.card)}>
                            <Typography gutterBottom variant="h5" color='text.primary'>
                                View images
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </div>

            <InfoArea>
                <LeftArea>
                    <div {...x.props(s.leftAreaSection)}>
                        <Typography variant="h6" mb={1} color='text.primary'>
                            Base url
                        </Typography>
                        <div {...x.props(s.flexContainer)}>
                            <Chip label={suiteConfig?.baseUrl} variant='outlined' />
                        </div>
                    </div>

                    <div {...x.props(s.leftAreaSection)}>
                        <Typography variant="h6" mb={1} color='text.primary'>
                            Viewports
                        </Typography>
                        <div {...x.props(s.flexContainer)}>
                            {parsedViewports?.map((viewport, index) => (
                                <Chip key={index} label={viewport} variant='outlined' />
                            ))}
                        </div>
                    </div>

                    {suiteConfig?.files.length && (
                        <div {...x.props(s.leftAreaSection)}>
                            <Typography variant="h6" mb={1} color='text.primary'>
                                Files
                            </Typography>
                            <div {...x.props(s.flexContainer, s.wrap)}>
                                {suiteConfig?.files.map((file, index) => (
                                    <a
                                        href={suiteConfig?.fileEndpoint + file}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        <Button
                                            variant='text'
                                            color='primary'
                                            startIcon={<FileOpenTwoToneIcon />}
                                            key={index}
                                        >
                                            {file.charAt(0).toUpperCase() + file.slice(1)}
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <CollapsibleSection heading={'Directory'} initialExpanded>
                        <Typography variant="body2" mb={1} color='text.primary'>
                            {suiteConfig?.directory}
                        </Typography>
                        <RawFilePanel path={suiteConfig?.directory} />
                    </CollapsibleSection>

                    <CollapsibleSection heading={'onPageVisit'}>
                        {suiteConfig?.onPageVisit}
                    </CollapsibleSection>

                    <CollapsibleSection heading={'formatUrl'}>
                        {suiteConfig?.formatUrl}
                    </CollapsibleSection>
                </LeftArea>

                <div {...x.props(s.endpointsSection)}>
                    <Typography variant="h6" mb={3} color='text.primary'>
                        Endpoints
                    </Typography>
                    <EndpointsList endpoints={suiteConfig?.endpoints} />
                </div>
            </InfoArea>
        </div>
    );
};

export default SuiteHome;