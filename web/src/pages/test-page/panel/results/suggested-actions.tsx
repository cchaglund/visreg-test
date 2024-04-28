import { Badge, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../../../components/ui/helper-styles';
import ViewWeekTwoToneIcon from '@mui/icons-material/ViewWeekTwoTone';
import ReplayTwoToneIcon from '@mui/icons-material/ReplayTwoTone';
import { ActionCard } from '../../../../components/ui/action-card';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';
import SkipNextTwoToneIcon from '@mui/icons-material/SkipNextTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
// import GpsFixedTwoToneIcon from '@mui/icons-material/GpsFixedTwoTone';
import { ResultsColumn } from './results-column';

export const SuggestedActions = () => {
    const { 
        failingEndpoints,
        skippedEndpoints,
        visregSummary,
        suiteConfig,
        startTest,
        addTargetViewport,
        addTargetEndpoint,
    } = useContext(TestContext);

    const navigate = useNavigate();

    if (!visregSummary) return null;    

    const diffsCount = visregSummary.testDiffList.length || 0;
    const failedCount = failingEndpoints.length;
    const skippedCount = skippedEndpoints.length;
    
    return (
        <ResultsColumn heading={'Actions'}>
            <div {...x.props(style.flex, style.justifyCenter, style.flexWrap, style.gap2)}>

                {diffsCount > 0 && (
                    <ActionCard onClick={() => {
                        const searchParams = new URLSearchParams();
                        searchParams.append("diff-list-subset", JSON.stringify(visregSummary.testDiffList));
                        navigate(`/suite/${suiteConfig.suiteSlug}/assessment/?${searchParams.toString()}`);
                    }}>
                        <Badge badgeContent={diffsCount} color={'primary'}>
                            <ViewWeekTwoToneIcon fontSize='large' color='primary' />
                        </Badge>
                        <Typography gutterBottom mt={2} variant="body1" color={'primary'}>
                            Assess diffs from this test
                        </Typography>
                    </ActionCard>
                )}

                {failedCount > 0 && (
                    <ActionCard onClick={() => {
                        failingEndpoints.forEach(e => {
                            addTargetViewport(e.viewport);
                            addTargetEndpoint(e.endpointTitle);
                        });

                        startTest('targetted')}
                    }>
                        <ErrorTwoToneIcon fontSize='large' color='primary' />
                        <Typography gutterBottom mt={2} variant="body1" color={'primary'}>
                            Re-test {failedCount} <u>failing</u>
                        </Typography>
                    </ActionCard>
                )}
                
                {skippedCount > 0 && (
                    <ActionCard onClick={() => {
                        skippedEndpoints.forEach(e => {
                            addTargetViewport(e.viewport);
                            addTargetEndpoint(e.endpointTitle);
                        });

                        startTest('targetted')}
                    }>
                        <SkipNextTwoToneIcon fontSize='large' color='primary' />
                        <Typography gutterBottom mt={2} variant="body1" color={'primary'}>
                            Re-test {skippedCount} <u>skipped</u>
                        </Typography>
                    </ActionCard>
                )}

                <ActionCard onClick={() => {
                    visregSummary.programChoices.targetViewports.forEach(addTargetViewport);
                    visregSummary.programChoices.targetEndpointTitles.forEach(addTargetEndpoint);
                    startTest(visregSummary.testType);
                }}>
                    <ReplayTwoToneIcon fontSize='large' color='primary' />
                    <Typography gutterBottom mt={2} variant="h6" color={'primary'}>
                        Re-run test
                    </Typography>
                </ActionCard>

                <ActionCard onClick={() => navigate(`/suite/${suiteConfig.suiteSlug}/images`)}>
                    <ImageTwoToneIcon fontSize='large' color='primary' />
                    <Typography gutterBottom mt={2} variant="h6" color={'primary'}>
                        Gallery
                    </Typography>
                </ActionCard>

            </div>
        </ResultsColumn>
    );
};
