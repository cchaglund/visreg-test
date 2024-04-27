import { Badge, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuiteContext } from '../suite-page';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';
import RollerSkatingTwoToneIcon from '@mui/icons-material/RollerSkatingTwoTone';
import ViewWeekTwoToneIcon from '@mui/icons-material/ViewWeekTwoTone';

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

const Actions = ({ suiteSlug }: { suiteSlug: string }) => {
    const { imagesList } = useContext(SuiteContext);
    const navigate = useNavigate();

    return (
        <div {...x.props(s.actions)}>
            <Card elevation={imagesList?.diffList?.length ? 7 : 0} sx={{ borderRadius: '1rem'}}>
                <CardActionArea onClick={() => navigate('/assessment/' + suiteSlug)} disabled={!imagesList?.diffList?.length}>
                    <CardContent {...x.props(s.card)}>
                        <Badge badgeContent={imagesList?.diffList.length} color={imagesList?.diffList?.length ? 'primary' : 'secondary'}>
                            <ViewWeekTwoToneIcon fontSize='large' color={imagesList?.diffList?.length ? 'primary' : 'disabled'} />
                        </Badge>
                        <Typography gutterBottom mt={2} variant="h6" color={imagesList?.diffList?.length ? 'primary' : 'text.disabled'}>
                            Assess all diffs
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>

            <Card elevation={7} sx={{ borderRadius: '1rem'}}>
                <CardActionArea onClick={() => navigate(`/suite/${suiteSlug}/run-test`)}>
                    <CardContent {...x.props(s.card)}>
                        <RollerSkatingTwoToneIcon fontSize='large' color='primary' />
                        <Typography gutterBottom mt={2} variant="h6" color='primary'>
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
                            View images
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </div>
    );
}

export default Actions;
