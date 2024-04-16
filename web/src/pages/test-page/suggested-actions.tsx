import { Badge, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../components/ui/helper-styles';
import ViewWeekTwoToneIcon from '@mui/icons-material/ViewWeekTwoTone';
import CrisisAlertTwoToneIcon from '@mui/icons-material/CrisisAlertTwoTone';
import { ActionCard } from '../../components/ui/action-card';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';

export const SuggestedActions = () => {
    const { 
        failingEndpoints,
        summary,
        suiteConfig,
    } = useContext(TestContext);
    
    const navigate = useNavigate();
    
    return (
        <div>
            <Typography variant='h5' color={'text.primary'} mb={3}>Actions</Typography>
            <div {...x.props(style.flex, style.justifyCenter, style.gapL, style.mb4)}>
                {summary?.diffList?.length && summary?.diffList?.length > 0 && (
                    <ActionCard onClick={() => navigate('/assessment/' + suiteConfig.suiteSlug)}>
                        <Badge badgeContent={summary?.diffList.length} color={'primary'}>
                            <ViewWeekTwoToneIcon fontSize='large' color='primary' />
                        </Badge>
                        <Typography gutterBottom mt={2} variant="h6" color={'primary'}>
                            Assess diffs
                        </Typography>
                    </ActionCard>
                )}

                {failingEndpoints.length > 0 && (
                    <ActionCard onClick={() => console.log('clicked')}>
                        <CrisisAlertTwoToneIcon fontSize='large' color='primary' />
                        <Typography gutterBottom mt={2} variant="body1" color={'primary'}>
                            Run targetted test on failing endpoints
                        </Typography>
                    </ActionCard>
                )}
            </div>
        </div>
    );
};
