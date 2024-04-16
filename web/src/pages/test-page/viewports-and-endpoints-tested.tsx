import { ArticleTwoTone } from '@mui/icons-material';
import VrpanoTwoToneIcon from '@mui/icons-material/VrpanoTwoTone';
import { Typography, Chip } from '@mui/material';
import { ChipContainer } from '../../components/ui/chips-container';
import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';

export const ViewportsAndEndpointsTested = () => {
    const { passingEndpoints } = useContext(TestContext);

    const uniqueEndpoints = new Set<string>();
    const uniqueViewports = new Set<string>();

    passingEndpoints.forEach(endpoint => {
        uniqueEndpoints.add(endpoint.endpointName);
        uniqueViewports.add(endpoint.viewport);
    });

    if (passingEndpoints.length === 0) {
        return (
            <Typography
                variant='h5'
                color={'text.primary'}
                mb={3}
            >
                No endpoints tested
            </Typography>
        );
    }

    return (
        <div>
            <Typography
                variant='h5'
                color={'text.primary'}
                mb={3}
            >
                Tested
            </Typography>

            <div>
                <Typography 
                    variant='body1'
                    color={'text.primary'}
                    mb={2}
                >
                    Endpoints
                </Typography>

                <ChipContainer>
                    {Array.from(uniqueEndpoints).map((endpoint, index) => (
                        <Chip
                            key={index}
                            label={endpoint}
                            color='secondary'
                            icon={<ArticleTwoTone />}
                        />
                    ))}
                </ChipContainer>

                <Typography
                    variant='body1'
                    color={'text.primary'}
                    mb={2}
                    mt={2}
                >
                    Viewports
                </Typography>

                <ChipContainer>
                    {Array.from(uniqueViewports).map((viewport, index) => (
                        <Chip
                            key={index}
                            label={viewport}
                            color='secondary'
                            icon={<VrpanoTwoToneIcon />}
                        />
                    ))}
                </ChipContainer>
            </div>
        </div>
    );
};
