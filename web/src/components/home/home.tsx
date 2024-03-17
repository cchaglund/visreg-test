import { useLoaderData, useNavigate } from 'react-router-dom';
import { ProjectInformationData } from '../navigation/menu';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import stylex from '@stylexjs/stylex';

const s = stylex.create({
    wrapper: {
        height: '100%',
        width: '100%',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        margin: '4rem',
    },
    card: {
        width: 170,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

const Home = () => {
    const { projectInformation } = useLoaderData() as ProjectInformationData;
    const navigate = useNavigate();

    return (
        <div {...stylex.props(s.wrapper)}>
            <div {...stylex.props(s.container)}>
                {projectInformation?.suites?.map((suite, index) => (
                    <Card elevation={3} key={index}>
                        <CardActionArea onClick={() => navigate(`/suite/${suite}`)}>
                            <CardContent {...stylex.props(s.card)}>
                                <Typography gutterBottom variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                                    {suite}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Home;
