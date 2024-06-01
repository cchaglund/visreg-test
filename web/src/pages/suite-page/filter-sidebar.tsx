import { useLoaderData, useLocation } from 'react-router-dom';
import stylex from '@stylexjs/stylex';
import { Button, Chip, Typography } from '@mui/material';
import { SuitePageData } from './suite-page';
import VrpanoTwoToneIcon from '@mui/icons-material/VrpanoTwoTone';
import { style } from '../../components/ui/helper-styles';
import { ArticleTwoTone } from '@mui/icons-material';

const s = stylex.create({
    suitePageContent: {
        display: 'flex',
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    suitePageSidebar: {
        maxWidth: '220px',
        width: '100%',
        marginRight: '4rem',
    },
    chipContainer: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    section: {
        marginBottom: '2rem',
    },
});

type SidebarProps = {
    parsedViewports: string[];
    endpointsState: [string[], React.Dispatch<React.SetStateAction<string[]>>];
    viewportsState: [string[], React.Dispatch<React.SetStateAction<string[]>>];
};

const FilterSidebar = (props: SidebarProps) => {
    const location = useLocation();
    const { suiteSlug, suiteConfig } = useLoaderData() as SuitePageData;
    const { parsedViewports, endpointsState, viewportsState } = props;
    const [ selectedEndpoints, setSelectedEndpoints ] = endpointsState;
    const [ selectedViewports, setSelectedViewports ] = viewportsState;

    const StyledSidebar = (props: { children: React.ReactNode; }) => (
        <div {...stylex.props(s.suitePageSidebar)}>
            {props.children}
        </div>
    );

    const Section = (props: { children: React.ReactNode; }) => (
        <div {...stylex.props(s.section)}>
            {props.children}
        </div>
    );

    const ChipContainer = (props: { children: React.ReactNode; }) => (
        <div {...stylex.props(s.chipContainer)}>
            {props.children}
        </div>
    );

    const toggleEndpointSelection = (name: string) => {
        setSelectedEndpoints(prev => {
            return prev.includes(name) 
                ? prev.filter(n => n !== name)
                : [ ...prev, name ]
        });
    };

    const toggleViewportsSelection = (viewport: string | number[]) => {
        const viewportString = Array.isArray(viewport) ? viewport.join(',') : viewport;
        setSelectedViewports(prev => {
            return prev.includes(viewportString) 
                ? prev.filter(v => v !== viewportString)
                : [ ...prev, viewportString ]
        });
    };

    if (
        location.pathname.includes('.png')
        || location.pathname === `/suite/${suiteSlug}`
        || location.pathname === `/suite/${suiteSlug}/run-test`
        || location.pathname.includes(`/suite/${suiteSlug}/assessment`)
        || location.pathname.includes(`/suite/${suiteSlug}/history`)
    ) {
        return <div></div>;
    }

    return (
        <StyledSidebar>
            <Section>
                <div {...stylex.props(style.flex, style.alignCenter, style.mb1)}>
                    <ArticleTwoTone />
                    <Typography variant="h6" ml={1} color='text.primary'>
                        Endpoints
                    </Typography>
                </div>
                <ChipContainer>
                    {suiteConfig?.endpoints?.map((endpoint, index) => (
                        <Chip
                            key={index}
                            label={endpoint.title}
                            onClick={() => toggleEndpointSelection(endpoint.title)}
                            disabled={location.pathname === `/suite/${suiteSlug}`}
                            variant={selectedEndpoints.find(name => name === endpoint.title) ? 'filled' : 'outlined'}
                            clickable
                            color='secondary'
                        />
                    ))}
                </ChipContainer>
            </Section>
            <Section>
                <div {...stylex.props(style.flex, style.alignCenter, style.mb1)}>
                    <VrpanoTwoToneIcon />
                    <Typography variant="h6" ml={1} color='text.primary'>
                        Viewports
                    </Typography>
                </div>

                <ChipContainer>
                    {parsedViewports?.map((viewport, index) => (
                        <Chip
                            key={index}
                            label={viewport}
                            onClick={() => toggleViewportsSelection(viewport)}
                            disabled={location.pathname === `/suite/${suiteSlug}`}
                            variant={selectedViewports.find(vp => vp === viewport)  ? 'filled' : 'outlined'}
                            clickable
                            color='secondary'
                        />
                    ))}
                </ChipContainer>
            </Section>
            <Section>
                <Button variant='text' size='small' color='secondary' onClick={() => {
                    setSelectedEndpoints([]);
                    setSelectedViewports([]);
                }}>
                    Clear filter
                </Button>
            </Section>
        </StyledSidebar>
    );
};

export default FilterSidebar;
