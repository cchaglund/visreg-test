import { useLoaderData, useNavigate } from 'react-router-dom';
import { ProjectInformationData } from '../../components/navigation/menu';
import { Typography } from '@mui/material';
import stylex from '@stylexjs/stylex';
import { ActionCard } from '../../components/ui/action-card';

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
                    <ActionCard key={index} onClick={() => navigate(`/suite/${suite}`)}>
                        <Typography variant="h5" color={'primary'}>
                            {suite}
                        </Typography>
                    </ActionCard>
                ))}
            </div>
        </div>
    );
};

export default Home;
