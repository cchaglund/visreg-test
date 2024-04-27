import { Chip } from '@mui/material';
import { ChipContainer } from '../../../../components/ui/chips-container';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ResultsColumn } from './results-column';
import { Close } from '@mui/icons-material';

export const FailedChips = () => {
    const { failingEndpoints } = useContext(TestContext);

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
