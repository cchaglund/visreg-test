import { Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { Close } from '@mui/icons-material';
import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';
import { FailedEndpointDetails } from './failed-endpoint-details';

const s = x.create({
    testNameContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    columnsContainer: {
        display: 'flex',
        gap: '4rem',
        justifyContent: 'center'
    },
    column: {
        width: 'max-content',
        maxWidth: '700px',
    },
});

export const TestFailures = () => {
    const { failingEndpoints } = useContext(TestContext);

    if (failingEndpoints.length === 0) return null;

    return (
        <div {...x.props(s.columnsContainer)}>
            <div {...x.props(s.column)}>
                <div {...x.props(s.testNameContainer)}>
                    <Close color='error' />
                    <Typography
                        variant='h5'
                        color={'text.primary'}
                    >
                        Failed to run
                    </Typography>
                </div>

                {failingEndpoints.map((failedEndpoint, index) => (
                    <FailedEndpointDetails
                        key={index}
                        failedEndpoint={failedEndpoint}
                    />
                ))}
            </div>
        </div>
    );
};