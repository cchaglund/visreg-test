import { useLoaderData } from 'react-router-dom';
import { SuiteContext } from '../suite-page';
import { useContext } from 'react';
import { Typography } from '@mui/material';
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
        maxWidth: '1400px',
        margin: '0 auto',
    },
    endpointsSection: {
        flexGrow: 1,
    },
    mt1: {
        marginTop: '1rem',
    },
    mt2: {
        marginTop: '2rem',
    },
});

export type SuitePageData = {
    suiteSlug: string;
    fileNames: string[];
    typeOfFiles: string;
};

const SuiteHome = () => {
    const { suiteConfig } = useContext(SuiteContext);
    const { suiteSlug } = useLoaderData() as SuitePageData;

    return (
        <div {...x.props(s.suiteHomeContainer)}>
            <div {...x.props(s.header)}>
                <Typography variant="h4" mb={0} color='text.primary'>
                    {suiteSlug}
                </Typography>
            </div>

            <Actions suiteSlug={suiteSlug} />

            <div {...x.props(s.infoArea)}>
                <SuiteDetailsSidebar />

                <div {...x.props(s.endpointsSection)}>
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
