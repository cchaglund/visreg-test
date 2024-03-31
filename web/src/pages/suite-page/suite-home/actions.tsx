import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { useNavigate } from 'react-router-dom';

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
    },
    comingSoon: {
        flexDirection: 'column',
        color: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        cursor: 'default',
    },
});

const Actions = ({ suiteSlug }: { suiteSlug: string }) => {
    const navigate = useNavigate();

    return (
        <div {...x.props(s.actions)}>
        <Card elevation={4}>
            <CardActionArea onClick={() => navigate(`/suite/${suiteSlug}/test`)}>
                <CardContent {...x.props(s.card)}>
                    <Typography gutterBottom variant="h5" color='text.primary'>
                        Run test
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>

        <Card elevation={4}>
            <CardActionArea onClick={() => navigate(`/suite/${suiteSlug}/images`)}>
                <CardContent {...x.props(s.card)}>
                    <Typography gutterBottom variant="h5" color='text.primary'>
                        View images
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    </div>
    );
}

export default Actions;
