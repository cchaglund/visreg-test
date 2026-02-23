import { Card, CardActionArea, CardContent, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { useContext, useState } from 'react';
import { TestContext, TestTypeSlug } from '../../../contexts/test-context';

const s = x.create({
    cardSection: {
        width: 'min-content',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        height: 'min-content',
    },
    cardContent: {
        paddingBottom: 0,
    },
    suiteList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        marginTop: '0.5rem',
        maxHeight: '300px',
        overflowY: 'auto',
    },
});

type SuiteQueueSelectorProps = {
    testType: TestTypeSlug;
};

export const SuiteQueueSelector = ({ testType }: SuiteQueueSelectorProps) => {
    const {
        testStatus,
        startQueueTest,
        suiteConfig,
        allSuites,
    } = useContext(TestContext);

    const otherSuites = allSuites.filter(s => s !== suiteConfig.suiteSlug);
    const [selectedSuites, setSelectedSuites] = useState<string[]>([]);

    if (otherSuites.length === 0) {
        return null;
    }

    const isDisabled = testStatus === 'running' || testStatus === 'terminating';

    const toggleSuite = (suite: string) => {
        setSelectedSuites(prev =>
            prev.includes(suite)
                ? prev.filter(s => s !== suite)
                : [...prev, suite]
        );
    };

    const toggleAll = () => {
        if (selectedSuites.length === otherSuites.length) {
            setSelectedSuites([]);
        } else {
            setSelectedSuites([...otherSuites]);
        }
    };

    const queuedSuites = [suiteConfig.suiteSlug, ...selectedSuites];
    const canRun = selectedSuites.length > 0;

    return (
        <Card
            elevation={isDisabled ? 0 : 3}
            sx={{ borderRadius: '1rem' }}
            {...x.props(s.cardSection)}
        >
            <CardContent {...x.props(s.cardContent)}>
                <Typography variant='h5' color={isDisabled ? 'text.disabled' : 'text.primary'} mb={1}>
                    Queue
                </Typography>
                <Typography variant='body1' color={isDisabled ? 'text.disabled' : 'text.primary'} mb={1}>
                    Run a {testType} test across multiple suites sequentially
                </Typography>

                <FormGroup {...x.props(s.suiteList)}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={true}
                                disabled={true}
                            />
                        }
                        label={
                            <Typography variant='body2' color='text.secondary'>
                                {suiteConfig.suiteSlug} (current)
                            </Typography>
                        }
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectedSuites.length === otherSuites.length}
                                indeterminate={selectedSuites.length > 0 && selectedSuites.length < otherSuites.length}
                                onChange={toggleAll}
                                disabled={isDisabled}
                            />
                        }
                        label={
                            <Typography variant='body2' fontWeight='bold'>
                                Select all
                            </Typography>
                        }
                    />
                    {otherSuites.map(suite => (
                        <FormControlLabel
                            key={suite}
                            control={
                                <Checkbox
                                    checked={selectedSuites.includes(suite)}
                                    onChange={() => toggleSuite(suite)}
                                    disabled={isDisabled}
                                    size='small'
                                />
                            }
                            label={<Typography variant='body2'>{suite}</Typography>}
                        />
                    ))}
                </FormGroup>
            </CardContent>

            <CardActionArea
                sx={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                disabled={isDisabled || !canRun}
                onClick={() => startQueueTest(testType, queuedSuites)}
            >
                <Typography variant='h6' color={isDisabled || !canRun ? 'text.disabled' : 'primary'}>
                    Run {queuedSuites.length} suite{queuedSuites.length > 1 ? 's' : ''}
                </Typography>
            </CardActionArea>
        </Card>
    );
};
