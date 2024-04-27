import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { FailedEndpointDetails } from './failed-endpoint-details';
import { ResultsColumn } from './results-column';
import { style } from '../../../../components/ui/helper-styles';
import x from '@stylexjs/stylex';

export const FailedList = () => {
    const { failingEndpoints } = useContext(TestContext);

    if (failingEndpoints.length === 0) return null;

    return (
        <ResultsColumn heading={`Failed (${failingEndpoints.length})`}>
            {[ ...failingEndpoints ].map((failedEndpoint, index) => (
                <div {...x.props(index !== 0 && style.mt2)} key={index}>
                    <FailedEndpointDetails
                        key={index}
                        number={index + 1}
                        failedEndpoint={failedEndpoint}
                    />
                </div>
            ))}
        </ResultsColumn>
    );
};
