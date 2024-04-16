import { Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import EndpointsTable from '../../components/endpoints-info-table/endpoints-table';
import { style } from '../../components/ui/helper-styles';
import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';
import { EndpointTestResult } from '../../components/terminal/terminal';


export const FailedEndpointDetails = (props: { failedEndpoint: EndpointTestResult; }) => {
    const { suiteConfig } = useContext(TestContext);

    const { failedEndpoint } = props;

    return (
        <div {...x.props(style.mb4)}>
            <Typography variant='body1' color={'text.primary'}>
                {failedEndpoint.testTitle}
            </Typography>

            <Typography variant='body2' color={'text.primary'} mt={2} mb={2}>
                {failedEndpoint.errorMessage}
            </Typography>

            {...suiteConfig.endpoints
                .filter(endpoint => endpoint.title === failedEndpoint.endpointName)
                .map(endpoint => (
                    <EndpointsTable endpoints={[ endpoint ]} />
                ))
            }
        </div>
    );
};
