import { useLoaderData } from 'react-router-dom';
import { SuiteContext } from '../suite-page';
import { useContext } from 'react';
import { Chip, Link, Typography } from '@mui/material';
import EndpointsList from '../../../components/endpoints-info-table/endpoints-table';
import x from '@stylexjs/stylex';
import Actions from './actions';
import SuiteDetailsSidebar from './details-sidebar';


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
    infoArea: {
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '3rem',
        maxWidth: '1300px',
        margin: '0 auto',
    },
    endpointsSection: {
        flexGrow: 1,
        maxWidth: '800px',
    },
    mt1: {
        marginTop: '1rem',
    },
    mt2: {
        marginTop: '2rem',
    },
    leftAreaSection: {
        marginBottom: '2rem',
    },
    leftArea: {
        width: '400px',
    },
    flexContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
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

    return (
        <div {...x.props(s.suiteHomeContainer)}>
            <Typography color='text.primary' variant='h4' sx={{ textAlign: 'center', mb: 1, width: '100%' }}>
                {suiteSlug}
            </Typography>
            <Typography color='text.secondary' variant='h6' sx={{ textAlign: 'center', mb: 1, width: '100%' }}>
                <Link href={suiteConfig?.baseUrl} target='_blank' rel='noreferrer'>
                    {suiteConfig?.baseUrl}
                </Link>
            </Typography>

            <Actions suiteSlug={suiteSlug} />

            <div {...x.props(s.infoArea)}>
                <SuiteDetailsSidebar />

                <div {...x.props(s.endpointsSection)}>
                    <div {...x.props(s.leftAreaSection)}>
                        <Typography variant="h6" mb={1} color='text.primary'>
                            Viewports
                        </Typography>
                        <div {...x.props(s.flexContainer)}>
                            {parsedViewports?.map((viewport, index) => (
                                <Chip key={index} label={viewport} variant='filled' />
                            ))}
                        </div>
                    </div>

                    <Typography variant="h6" mb={3} color='text.primary'>
                        Endpoints
                    </Typography>
                    <EndpointsList endpoints={suiteConfig?.endpoints} />
                </div>
            </div>
        </div>
    );
};

export default SuiteHome;
