import { ArticleTwoTone } from '@mui/icons-material';
import VrpanoTwoToneIcon from '@mui/icons-material/VrpanoTwoTone';
import { Typography, Chip } from '@mui/material';
import { ProgramChoices } from '../../contexts/test-context';
import { ChipContainer } from '../ui/chips-container';
import { ResultsColumn } from './results-column';

export const SuccessfulChips = (props: { programChoices: ProgramChoices}) => {
    const { programChoices } = props;

    const noTestsPerformed = (
        programChoices.targetEndpointTitles.length === 0 &&
        programChoices.targetViewports.length === 0
    );

    if (noTestsPerformed) {
        return null;
    }        
    
    return (
        <div>
            <ResultsColumn heading={'Tested parameters'}>
                <div>
                    {programChoices.targetEndpointTitles.length !== 0 && (
                        <>
                            <Typography
                                variant='body1'
                                color={'text.primary'}
                                mb={2}
                            >
                                Endpoints
                            </Typography>

                            <ChipContainer>
                                {programChoices.targetEndpointTitles.map((endpoint, index) => (
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

                    {programChoices.targetViewports.length !== 0 && (
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
                                {programChoices.targetViewports.map((viewport, index) => (
                                    <Chip
                                        key={index}
                                        label={typeof viewport === 'string' ? viewport : viewport.join(',')}
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
