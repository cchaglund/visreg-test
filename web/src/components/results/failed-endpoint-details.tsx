import { Typography } from '@mui/material';
import { useContext } from 'react';
import x from '@stylexjs/stylex';
import { EndpointTestResult, TestContext } from '../../contexts/test-context';
import EndpointsTable from '../endpoints-info-table/endpoints-table';

const s = x.create({
    failedEndpointDetailsContainer: {
        minWidth: '240px',
        width: 'min-content',
    },
});

export const FailedEndpointDetails = (props: { failedEndpoint: EndpointTestResult; number: number}) => {
    const { suiteConfig } = useContext(TestContext);

    const { failedEndpoint, number } = props;

    return (
        <div {...x.props(s.failedEndpointDetailsContainer)}>
            <Typography 
                variant='body1'
                color='text.primary'
            >
                {`${number}) ${failedEndpoint.testTitle}`}
            </Typography>

            <Typography variant='body2' color={'text.primary'} mt={2} mb={2}>
                {failedEndpoint.errorMessage}
            </Typography>

            {...suiteConfig.endpoints
                .filter(endpoint => endpoint.title === failedEndpoint.endpointTitle)
                .map(endpoint => (
                    <EndpointsTable endpoints={[ endpoint ]} />
                ))
            }
        </div>
    );
};
