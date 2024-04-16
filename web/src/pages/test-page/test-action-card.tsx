import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../components/ui/helper-styles';
import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';

const s = x.create({
    cardSection: {
        width: '100%',
        maxWidth: '300px',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        height: 'min-content',
    },
    cardActionArea: {
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        paddingBottom: 0,
    },
    disabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    heading: {
        marginBottom: '1rem',
    },
    description: {
        marginBottom: '2rem',
    },
});

type TestActionCardProps = { 
    title: string;
    description: string;
    testType: string;
    children?: React.ReactNode;
}

export const TestActionCard = (props: TestActionCardProps) => {
    const { testStatus, startTest } = useContext(TestContext);
    const { title, description, testType, children } = props;

    return (
        <Card
            elevation={testStatus === 'running' ? 0 : 4}
            {...x.props(
                s.cardSection,
                style.br1,
                testStatus === 'running' && s.disabled
            )}
        >
            <CardContent {...x.props(s.cardContent)}>
                <div>
                    <Typography variant='h5' color={'text.primary'} {...x.props(s.heading)}>
                        {title}
                    </Typography>
                    <Typography variant='body1' color={'text.primary'} {...x.props(s.description)}>
                        {description}
                    </Typography>
                </div>

                {children}
            </CardContent>

            <CardActionArea 
                {...x.props(s.cardActionArea)}
                disabled={testStatus === 'running'}
                onClick={() => startTest(testType)}
            >
                <Typography variant='h6' color={testStatus === 'running' ? 'default' : 'primary'}>
                    Run
                </Typography>
            </CardActionArea>
        </Card>
    );
};
