import { Badge, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ImagesList } from '../suite-page';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';
import RollerSkatingTwoToneIcon from '@mui/icons-material/RollerSkatingTwoTone';
import ViewWeekTwoToneIcon from '@mui/icons-material/ViewWeekTwoTone';
import { useContext } from 'react';
import { AppContext } from '../../../contexts/app-context';

const s = x.create({
    actions: {
        padding: '2rem',
        display: 'flex',
        gap: '3rem',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    card: {
        width: 170,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'column',
    },
    comingSoon: {
        flexDirection: 'column',
        color: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        cursor: 'default',
    },
});

const Actions = () => {
    const { currentDiffIndex } = useContext(AppContext);
    const { suiteSlug, imagesList } = useLoaderData() as { suiteSlug: string; imagesList: ImagesList};
    const navigate = useNavigate();

    const assessmentsDisabled = imagesList?.diffList?.length === 0;
    const ongoingAssessment = currentDiffIndex !== null;        

    return (
        <div {...x.props(s.actions)}>
            <Card
                elevation={assessmentsDisabled ? 0 : 7}
                sx={{ borderRadius: '1rem'}}
            >
                <CardActionArea 
                    onClick={() => {
                        const url = ongoingAssessment
                            ? `/suite/${suiteSlug}/assessment/?resume=true`
                            : `/suite/${suiteSlug}/assessment`;

                        navigate(url)
                    }}
                    disabled={assessmentsDisabled}
                >
                    <CardContent {...x.props(s.card)}>
                        <Badge 
                            badgeContent={ongoingAssessment ? '?' : imagesList?.diffList.length} 
                            color={assessmentsDisabled ? 'secondary' : 'primary'}

                        >
                            <ViewWeekTwoToneIcon 
                                fontSize='large'
                                color={assessmentsDisabled ? 'disabled' : 'primary'}
                            />
                        </Badge>
                        <Typography 
                            gutterBottom 
                            mt={2}
                            variant={ongoingAssessment ? 'body1' : 'h6'}
                            color={assessmentsDisabled ? 'text.disabled' : 'primary'}
                        >
                            {ongoingAssessment
                                ? 'Resume ongoing assessment'
                                : 'Assess all diffs'
                            }
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>

            <Card
                elevation={ongoingAssessment ? 0 : 7}
                sx={{ borderRadius: '1rem'}}
            >
                <CardActionArea
                    onClick={() => navigate(`/suite/${suiteSlug}/run-test`)}
                    disabled={ongoingAssessment}
                >
                    <CardContent {...x.props(s.card)}>
                        <RollerSkatingTwoToneIcon
                            fontSize='large'
                            color={ongoingAssessment ? 'disabled' : 'primary'}
                        />
                        <Typography 
                            gutterBottom 
                            mt={2}
                            variant='h6'
                            color={ongoingAssessment ? 'text.disabled' : 'primary'}
                        >
                            Run tests
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>

            <Card elevation={7} sx={{ borderRadius: '1rem'}}>
                <CardActionArea onClick={() => navigate(`/suite/${suiteSlug}/images`)}>
                    <CardContent {...x.props(s.card)}>
                        <ImageTwoToneIcon fontSize='large' color='primary' />
                        <Typography gutterBottom mt={2} variant="h6" color='primary'>
                            Gallery
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </div>
    );
}

export default Actions;
