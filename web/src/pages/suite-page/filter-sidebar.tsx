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
    endpointState: [string, React.Dispatch<React.SetStateAction<string>>];
    viewportState: [string, React.Dispatch<React.SetStateAction<string>>];
};

const FilterSidebar = (props: SidebarProps) => {
    const location = useLocation();
    const { suiteSlug, suiteConfig } = useLoaderData() as SuitePageData;
    const { parsedViewports, endpointState, viewportState } = props;
    const [ selectedName, setSelectedName ] = endpointState;
    const [ selectedViewport, setSelectedViewport ] = viewportState;

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

    const changeName = (name: string) => {
        setSelectedName(prev => prev === name ? '' : name);
    };

    const changeViewport = (viewport: string | number[]) => {
        const viewportString = Array.isArray(viewport) ? viewport.join(',') : viewport;
        setSelectedViewport(prev => prev === viewportString ? '' : viewportString);
    };

    if (
        location.pathname.includes('.png')
        || location.pathname === `/suite/${suiteSlug}`
        || location.pathname === `/suite/${suiteSlug}/run-test`
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
                            onClick={() => changeName(endpoint.title)}
                            disabled={location.pathname === `/suite/${suiteSlug}`}
                            variant={selectedName === endpoint.title ? 'filled' : 'outlined'}
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
                            onClick={() => changeViewport(viewport)}
                            disabled={location.pathname === `/suite/${suiteSlug}`}
                            variant={selectedViewport === viewport ? 'filled' : 'outlined'}
                            clickable
                            color='secondary'
                        />
                    ))}
                </ChipContainer>
            </Section>
            <Section>
                {/* <Typography
                    variant="body2"
                    mb={1}
                    sx={{ cursor: 'pointer', }}
                    color='text.primary'
                    onClick={() => {
                        setSelectedName('');
                        setSelectedViewport('');
                    }}
                >
                    Clear filter
                </Typography> */}
                <Button variant='text' size='small' color='secondary' onClick={() => {
                    setSelectedName('');
                    setSelectedViewport('');
                }}>
                    Clear filter
                </Button>
            </Section>
        </StyledSidebar>
    );
};

export default FilterSidebar;
