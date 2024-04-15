import { Badge, Card, CardActionArea, CardContent, Chip, Typography, useTheme } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import { api } from '../../shared';
import Terminal, { EndpointTestResult, SummaryObject } from '../../components/terminal/terminal';
import x from '@stylexjs/stylex';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { TestConfig } from '../../types';
import EndpointsTable from '../../components/endpoints-info-table/endpoints-table';
import CollapsibleSection from '../../components/ui/collapsible-section';
import { ArticleTwoTone, Check, Close } from '@mui/icons-material';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import NumbersTwoToneIcon from '@mui/icons-material/NumbersTwoTone';
import SkipNextTwoToneIcon from '@mui/icons-material/SkipNextTwoTone';
import { style } from '../../components/ui/helper-styles';
import VrpanoTwoToneIcon from '@mui/icons-material/VrpanoTwoTone';
import ViewWeekTwoToneIcon from '@mui/icons-material/ViewWeekTwoTone';
import CrisisAlertTwoToneIcon from '@mui/icons-material/CrisisAlertTwoTone';
import { ActionCard } from '../../components/ui/action-card';

export type SummaryPayload = {
    failed: boolean;
    duration: number;
    diffList: string[];
};

const s = x.create({
    testPage: {
        width: '100%',
        margin: '0 auto',
        maxWidth: '1400px',
    },
    testSection: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        padding: '1rem',
        marginBottom: '1rem',
        gap: '1rem',
    },
    disabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    chipContainer: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    testNameContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    cardsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        minWidth: '320px',
    },
    button: {
        height: 'fit-content',
    },
    heading: {
        marginBottom: '1rem',
    },
    description: {
        marginBottom: '2rem',
    },
    cardSection: {
        width: '100%',
        maxWidth: '400px',
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
    testrunPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    columnsContainer: {
        display: 'flex',
        gap: '4rem',
        justifyContent: 'center'
    },
    column: {
        // display: 'flex',
        // flexDirection: 'column',
        // gap: '1rem',
        width: 'max-content',
        maxWidth: '700px',
    },
    terminalContainer: {
        width: 'fit-content',
        margin: '0 auto',
        backgroundColor: '#0B2027',
        padding: '2rem',
        transition: 'box-shadow 0.2s',
    },
    terminalContainerHover: {
        ':hover': {
            boxShadow: 'rgba(0, 0, 0, 0.6) 0px 7px 10px -3px',
        },  
    },
    targettedSettingsHoverLight: {
        ':hover': {
            backgroundColor: '#F2EBE8',
        },
    },
    targettedSettingsHoverDark: {
        ':hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
    },
    targettedSettingsContainer: {
        padding: '1rem',
        border: '1px solid rgba(0, 0, 0, 0.3)',
        borderRadius: '0.75rem',
        transition: 'background-color 0.3s',
    },
    summarySection: {
        minHeight: '100vh',
        marginTop: '2rem',
    },

});

export type TestPageData = {
    suiteConfig: TestConfig;
};


const TestPage = () => {
    const theme = useTheme();
    const summaryRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { suiteConfig } = useLoaderData() as TestPageData;
    const [ testStatus, setTestStatus ] = useState('idle');
    const [ selectedName, setSelectedName ] = useState<string>('');
    const [ summary, setSummary ] = useState<SummaryPayload>();
    const [ runningTest, setRunningTest ] = useState<string>('');
    const [ terminalViewOpen, setTerminalViewOpen ] = useState<boolean>(false);
    const [ targettedSelectionOpen, setTargettedSelectionOpen ] = useState<boolean>(false);
    const [ selectedViewport, setSelectedViewport ] = useState<string>('');
    const [ summaryState, setSummaryFromTerminal ] = useState<SummaryObject>();
    const [ passingEndpoints, setPassingEndpoints ] = useState<EndpointTestResult[]>([]);
    const [ failingEndpoints, setFailingEndpoints ] = useState<EndpointTestResult[]>([]);

    const parsedViewports = suiteConfig?.viewports?.map(viewport => {
        if (Array.isArray(viewport)) return viewport.join(',');
        return viewport;
    });


    const startTest = async (testType: string) => {
        setPassingEndpoints([]);
        setFailingEndpoints([]);
        setSummary(undefined);

        setTerminalViewOpen(true);
        terminalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end'});
        // await new Promise(res => {
        //     setTimeout(() => res(1), 10);
        // });

        await new Promise(res => {
            setTimeout(() => res(1), 10);
        });

        const res = await fetch(`${api}/test/start-ws`, {
            method: 'GET',
        });

        if (res.ok) {
            setRunningTest(testType);
            setTestStatus('running');
        }
    };

    const onFinished = useCallback((summary: SummaryPayload) => {
        console.log('summary', summary);
        setSummary(summary);
        setTestStatus('done');

        console.log('setting terminal view closed?');
        
        setTerminalViewOpen(false);
        setTimeout(() => {
            summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }, []);

    const changeName = (name: string) => {
        setSelectedName(prev => prev === name ? '' : name);
    };

    const changeViewport = (viewport: string | number[]) => {
        const viewportString = Array.isArray(viewport) ? viewport.join(',') : viewport;
        setSelectedViewport(prev => prev === viewportString ? '' : viewportString);
    };

    const addToPassingEndpoints = (endpoint: EndpointTestResult) => {
        setPassingEndpoints(prev => [ ...prev, endpoint ]);
    };

    const addToFailingEndpoints = (failedEndpoint: EndpointTestResult) => {
        setFailingEndpoints(prev => [ ...prev, failedEndpoint ]);
    };

    const ChipContainer = (props: { children: React.ReactNode; flexColumn?: boolean}) => (
        <div {...x.props(s.chipContainer, props.flexColumn && style.flexColumn, props.flexColumn && style.alignStart)}>
            {props.children}
        </div>
    );

    const CardAction = (props: { testType: string; }) => (
        <CardActionArea onClick={() => startTest(props.testType)} {...x.props(s.cardActionArea)} disabled={testStatus === 'running'}>
            <Typography variant='h6' color={testStatus === 'running' ? 'default' : 'primary'}>
                Run
            </Typography>
        </CardActionArea>
    );


    const CardSection = (props: { title: string; description: string; testType: string; children?: React.ReactNode; }) => {
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
                            {props.title}
                        </Typography>
                        <Typography variant='body1' color={'text.primary'} {...x.props(s.description)}>
                            {props.description}
                        </Typography>
                    </div>

                    {props.children}
                </CardContent>

                <CardAction testType={props.testType} />
            </Card>
        );
    };

    const getUniqueEndpointTitlesAndViewports = () => {
        const uniqueEndpoints = new Set<string>();
        const uniqueViewports = new Set<string>();

        passingEndpoints.forEach(endpoint => {
            uniqueEndpoints.add(endpoint.endpointName);
            uniqueViewports.add(endpoint.viewport);
        });

        return (
            <div>
                <Typography variant='body1' color={'text.primary'} mb={2}>
                    Endpoints
                </Typography>
                <ChipContainer>
                    {Array.from(uniqueEndpoints).map((endpoint, index) => (
                        <Chip
                            key={index}
                            label={endpoint}
                            color='secondary'
                            icon={<ArticleTwoTone />}
                        />
                    ))}
                </ChipContainer>

                <Typography variant='body1' color={'text.primary'} mb={2} mt={2}>
                    Viewports
                </Typography>
                <ChipContainer>
                    {Array.from(uniqueViewports).map((viewport, index) => (
                        <Chip
                            key={index}
                            label={viewport}
                            color='secondary'
                            icon={<VrpanoTwoToneIcon />}
                        />
                    ))}
                </ChipContainer>
            </div>
        );
    };

    return (
        <div {...x.props(s.testPage)}>
            <Typography variant='h4' color={'text.primary'} mb={8} textAlign={'center'}>Run tests</Typography>

            <div>

                <div {...x.props(s.cardsContainer)}>
                    <CardSection
                        title='Full'
                        description='Run a full visual regression test of all endpoints and viewports (previous diffs are deleted)'
                        testType='full-test'
                    />

                    <CardSection
                        title='Diffs only'
                        description='Run a test of only the endpoints and viewports with existing diffs'
                        testType='diffs-only'
                    />

                    <CardSection
                        title='Targetted'
                        description='Run a test of a specific endpoint and/or viewport'
                        testType='targetted'
                    >
                        {(selectedName || selectedViewport) && (
                            <div {...x.props(style.mb2)}>
                                <ChipContainer>
                                    {selectedName && (
                                        <div>
                                            <Chip label={selectedName} color='secondary' icon={<ArticleTwoTone />} />
                                        </div>
                                    )}

                                    {selectedViewport && (
                                        <Chip label={selectedViewport} color='secondary' icon={<VrpanoTwoToneIcon />} />
                                    )}
                                </ChipContainer>
                            </div>
                        )}


                        <div {...x.props(
                            s.targettedSettingsContainer,
                            style.br75,
                            theme.palette.mode === 'dark' ? s.targettedSettingsHoverDark : s.targettedSettingsHoverLight
                        )}>
                            <CollapsibleSection
                                heading={(
                                    <Typography
                                        variant="body1"
                                        color='text.primary'
                                    >
                                        Select endpoint and viewport
                                    </Typography>
                                )}
                                initialExpanded={targettedSelectionOpen}
                                parentState={targettedSelectionOpen}
                                parentToggle={() => setTargettedSelectionOpen(!targettedSelectionOpen)}
                            >
                                <CardContent>
                                    <div>
                                        <Typography variant='body2' mb={1} color='text.primary'>
                                            Endpoint
                                        </Typography>
                                        <ChipContainer>
                                            {suiteConfig?.endpoints?.map((endpoint, index) => (
                                                <Chip
                                                    key={index}
                                                    label={endpoint.title}
                                                    onClick={() => changeName(endpoint.title)}
                                                    variant={selectedName === endpoint.title ? 'filled' : 'outlined'}
                                                    clickable
                                                    color='secondary'
                                                />
                                            ))}
                                        </ChipContainer>
                                    </div>

                                    <div>
                                        <Typography variant='body2' mb={1} mt={2} color='text.primary'>
                                            Viewport
                                        </Typography>
                                        <ChipContainer>
                                            {parsedViewports?.map((viewport, index) => (
                                                <Chip
                                                    key={index}
                                                    label={viewport}
                                                    onClick={() => changeViewport(viewport)}
                                                    variant={selectedViewport === viewport ? 'filled' : 'outlined'}
                                                    clickable
                                                    color='secondary'
                                                />
                                            ))}
                                        </ChipContainer>
                                    </div>
                                </CardContent>
                            </CollapsibleSection>
                        </div>
                    </CardSection>
                </div>

                <div {...x.props(s.testrunPanel)}>
                    <div 
                        ref={terminalRef}
                        {...x.props(
                            s.terminalContainer, 
                            style.br1,
                            style.mt2,
                            !terminalViewOpen && s.terminalContainerHover
                        )}>
                        <CollapsibleSection
                            heading={(
                                <Typography variant="h6" color={'#FCF7F8'}>
                                    Terminal
                                </Typography>)
                            }
                            duration={300}
                            initialExpanded={terminalViewOpen}
                            parentState={terminalViewOpen}
                            parentToggle={() => setTerminalViewOpen(!terminalViewOpen)}
                        >
                            <Terminal
                                onFinished={(summary: SummaryPayload) => onFinished(summary)}
                                suiteSlug={suiteConfig.suiteSlug}
                                testType={runningTest}
                                initiate={testStatus === 'running'}
                                setSummary={setSummaryFromTerminal}
                                addPassingEndpoint={addToPassingEndpoints}
                                addFailingEndpoint={addToFailingEndpoints}
                            />
                        </CollapsibleSection>
                    </div>

                    {summary && (
                        <div {...x.props(s.summarySection)} ref={summaryRef}>
                            <div {...x.props(style.flexColumn, style.alignCenter, style.mb1)}>
                                <Typography variant='h4' color={'text.primary'} marginBlock={'2rem'}>Results</Typography>
                            </div>

                            <div {...x.props(style.flex, style.justifyCenter, style.gap8)}>
                                <div>
                                    <Typography variant='h5' color={'text.primary'} mb={3}>Summary</Typography>
                                    {summaryState && (
                                        <ChipContainer flexColumn>
                                            <Chip label={`Total: ${summaryState.tests}`} icon={<NumbersTwoToneIcon />} />
                                            <Chip label={`Duration: ${summaryState.duration}s`} icon={<AccessTimeTwoToneIcon />} />
                                            {summaryState.skipped
                                                ? <Chip label={`Skipped: ${summaryState.skipped}`} icon={<SkipNextTwoToneIcon />} />
                                                : null
                                            }
                                            <Chip label={`Ran: ${summaryState.passing}`} color='success' icon={<Check />} />
                                            <Chip label={`Failed to run: ${summaryState.failing}`} color='error' icon={<Close />} />
                                        </ChipContainer>
                                    )}
                                </div>

                                {passingEndpoints.length > 0 && (
                                    <div>
                                        <Typography variant='h5' color={'text.primary'} mb={3}>Tested</Typography>
                                        {/* <div {...x.props(style.flex, style.justifyCenter, style.gapL, style.mb4)}>
                                            {passingEndpoints.map((passingEndpoint, index) => (
                                                <Typography variant='body1' color={'text.primary'} key={index}>
                                                    {passingEndpoint.testTitle}
                                                </Typography>
                                            ))}
                                        </div> */}
                                        {/* <ChipContainer>
                                            {passingEndpoints.map((passingEndpoint, index) => (
                                                <Chip
                                                    key={index}
                                                    label={passingEndpoint.testTitle}
                                                />
                                            ))}
                                        </ChipContainer> */}
                                        <ChipContainer>
                                            {getUniqueEndpointTitlesAndViewports()}
                                        </ChipContainer>
                                    </div>
                                )}

                                <div>
                                    <Typography variant='h5' color={'text.primary'} mb={3}>Actions</Typography>
                                    <div {...x.props(style.flex, style.justifyCenter, style.gapL, style.mb4)}>
                                        {summary?.diffList?.length > 0 && (
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

                            </div>




                            {/* <Typography variant='h5' color={'text.primary'} mb={3} textAlign={'center'}>Details</Typography> */}
                            <div {...x.props(s.columnsContainer)}>

                                {failingEndpoints.length > 0 && (
                                    <div {...x.props(s.column)}>
                                        <div {...x.props(s.testNameContainer)}>
                                            <Close color='error' />
                                            <Typography variant='h5' color={'text.primary'}>Failed to run</Typography>
                                        </div>

                                        {failingEndpoints.map((failedEndpoint, index) => (
                                            <div key={index} {...x.props(style.mb4)}>

                                                <Typography variant='body1' color={'text.primary'}>
                                                    {failedEndpoint.testTitle}
                                                </Typography>


                                                <Typography variant='body2' color={'text.primary'} mt={2} mb={2}>
                                                    {failedEndpoint.errorMessage}
                                                </Typography>

                                                {...suiteConfig.endpoints
                                                    .filter(endpoint => endpoint.title === failedEndpoint.endpointName)
                                                    .map(endpoint => <EndpointsTable endpoints={[ endpoint ]} />)
                                                }
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default TestPage;
