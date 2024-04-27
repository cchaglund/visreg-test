import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { useContext } from 'react';
import { TestContext, TestTypeSlug } from '../../../contexts/test-context';

const s = x.create({
    cardSection: {
        width: '100%',
        maxWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        height: 'min-content',
    },
    cardContent: {
        paddingBottom: 0,
    },
    disabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
});

type TestOptionProps = {
    title: string;
    description: string;
    body?: React.ReactNode;
    testType: TestTypeSlug;
    children?: React.ReactNode;
    disabled?: boolean;
};

export const TestOption = (props: TestOptionProps) => {
    const {
        testStatus,
        startTest,
        selectedTargetEndpoints,
        selectedTargetViewports,
    } = useContext(TestContext);

    const { title, description, body, testType, children } = props;

    const isDisabled = props.disabled || testStatus === 'running' || testStatus === 'terminating';

    const targettedDisabled = () => testType === 'targetted' && (!selectedTargetEndpoints.length && !selectedTargetViewports.length);

    return (
        <Card
            elevation={isDisabled ? 0 : 4}
            sx={{ borderRadius: '1rem' }}
            {...x.props(
                s.cardSection,
            )}
        >
            <CardContent {...x.props(s.cardContent)}>
                <div>
                    <Typography variant='h5' color={isDisabled ? 'text.disabled' : 'text.primary'} mb={1}>
                        {title}
                    </Typography>
                    <Typography variant='body1' color={isDisabled ? 'text.disabled' : 'text.primary'} mb={1}>
                        {description}
                    </Typography>
                    {body && (
                        <Typography variant='subtitle2' color={isDisabled ? 'text.disabled' : 'text.secondary'} mb={1}>
                            {body}
                        </Typography>
                    )}
                </div>

                {children}
            </CardContent>

            <CardActionArea
                sx={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                disabled={isDisabled || targettedDisabled()}
                onClick={() => startTest(testType)}
            >
                {targettedDisabled() ? (
                    <Typography variant='h6' color={'text.disabled'}>
                        Select target
                    </Typography>
                ) : (
                    <Typography variant='h6' color={isDisabled ? 'text.disabled' : 'primary'}>
                        Run
                    </Typography>
                )}
            </CardActionArea>
        </Card>
    );
};
