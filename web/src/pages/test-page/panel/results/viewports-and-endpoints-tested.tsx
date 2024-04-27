import { ArticleTwoTone } from '@mui/icons-material';
import VrpanoTwoToneIcon from '@mui/icons-material/VrpanoTwoTone';
import { Typography, Chip } from '@mui/material';
import { ChipContainer } from '../../../../components/ui/chips-container';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ResultsColumn } from './results-column';

export const ViewportsAndEndpointsTested = () => {
    const { visregSummary } = useContext(TestContext);

    const noTestsPerformed = (
        visregSummary?.programChoices.targetEndpointTitles.length === 0 &&
        visregSummary?.programChoices.targetViewports.length === 0
    );

    if (noTestsPerformed) {
        return null;
    }

    return (
        <div>
            <ResultsColumn heading={'Tested parameters'}>
                <div>
                    {visregSummary?.programChoices.targetEndpointTitles.length !== 0 && (
                        <>
                            <Typography
                                variant='body1'
                                color={'text.primary'}
                                mb={2}
                            >
                                Endpoints
                            </Typography>

                            <ChipContainer>
                                {visregSummary!.programChoices.targetEndpointTitles.map((endpoint, index) => (
                                    <Chip
                                        key={index}
                                        label={endpoint}
                                        color='secondary'
                                        icon={<ArticleTwoTone />}
                                    />
                                ))}
                            </ChipContainer>
                        </>
                    )}

                    {visregSummary?.programChoices.targetViewports.length !== 0 && (
                        <>
                            <Typography
                                variant='body1'
                                color={'text.primary'}
                                mb={2}
                                mt={2}
                            >
                                Viewports
                            </Typography>

                            <ChipContainer>
                                {visregSummary!.programChoices.targetViewports.map((viewport, index) => (
                                    <Chip
                                        key={index}
                                        label={viewport}
                                        color='secondary'
                                        icon={<VrpanoTwoToneIcon />}
                                    />
                                ))}
                            </ChipContainer>
                        </>
                    )}
                </div>
            </ResultsColumn>
        </div>
    );
};
