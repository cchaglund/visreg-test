import { Chip } from '@mui/material';
import { Close } from '@mui/icons-material';
import { EndpointTestResult } from '../../contexts/test-context';
import { ChipContainer } from '../ui/chips-container';
import { ResultsColumn } from './results-column';

export const FailedChips = (props: { failingEndpoints: EndpointTestResult[]}) => {
    const { failingEndpoints } = props;
    const failedUniqueEndpoints = new Set<string>();

    failingEndpoints.forEach(endpoint => {
        failedUniqueEndpoints.add(endpoint.endpointTitle);
    });

    if (failingEndpoints.length === 0) {
        return null;
    }

    return (
        <ResultsColumn heading={'Failed'}>
            <div>
                <ChipContainer>
                    {failingEndpoints
                        .map((endpoint, index) => (
                            <Chip
                                key={index}
                                label={`${endpoint.endpointTitle} @ ${endpoint.viewport}`}
                                variant='outlined'
                                color='secondary'
                                icon={<Close />}
                            />
                        ))
                    }
                </ChipContainer>
            </div>
        </ResultsColumn>
    );
};
