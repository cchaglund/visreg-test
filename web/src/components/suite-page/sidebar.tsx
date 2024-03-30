import { useLoaderData, useLocation } from 'react-router-dom';
import stylex from '@stylexjs/stylex';
import { Chip, Typography } from '@mui/material';
import { SuitePageData } from './suite-page';

const s = stylex.create({
    suitePageContent: {
        display: 'flex',
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    suitePageSidebar: {
        maxWidth: '220px',
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
    setSelectedName: React.Dispatch<React.SetStateAction<string>>;
    setSelectedViewport: React.Dispatch<React.SetStateAction<string>>;
    selectedName: string;
    selectedViewport: string;
    parsedViewports: string[];
};

const Sidebar = (props: SidebarProps) => {
    const location = useLocation();
    const { setSelectedName, setSelectedViewport, selectedName, selectedViewport, parsedViewports } = props;
    const { suiteSlug, suiteConfig } = useLoaderData() as SuitePageData;

    const Sidebar = (props: { children: React.ReactNode; }) => {
        if (location.pathname.includes('.png') || location.pathname === `/suite/${suiteSlug}`) return <div></div>;

        return (
            <div {...stylex.props(s.suitePageSidebar)}>
                {props.children}
            </div>
        );
    };

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

    return (
        <Sidebar>
            <Typography variant="h6" mb={4} color='text.primary'>
                Filter
            </Typography>
            <Section>
                <Typography variant="body1" mb={1} color='text.primary'>
                    Title
                </Typography>
                <ChipContainer>
                    {suiteConfig?.endpoints?.map((endpoint, index) => (
                        <Chip
                            key={index}
                            label={endpoint.title}
                            onClick={() => changeName(endpoint.title)}
                            disabled={location.pathname === `/suite/${suiteSlug}`}
                            variant={selectedName === endpoint.title ? 'filled' : 'outlined'}
                            clickable
                            color='primary'
                        />
                    ))}
                </ChipContainer>
            </Section>
            <Section>
                <Typography variant="body1" mb={1} color='text.primary'>
                    Viewport
                </Typography>

                <ChipContainer>
                    {parsedViewports?.map((viewport, index) => (
                        <Chip
                            key={index}
                            label={viewport}
                            onClick={() => changeViewport(viewport)}
                            disabled={location.pathname === `/suite/${suiteSlug}`}
                            variant={selectedViewport === viewport ? 'filled' : 'outlined'}
                            clickable
                            color='primary'
                        />
                    ))}
                </ChipContainer>
            </Section>
            <Section>
                <Typography
                    variant="body2"
                    mb={1}
                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                    color='text.primary'
                    onClick={() => {
                        setSelectedName('');
                        setSelectedViewport('');
                    }}
                >
                    Clear filter
                </Typography>
            </Section>
        </Sidebar>
    );
};

export default Sidebar;
