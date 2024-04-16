
import { Chip, Typography, CardContent, useTheme } from '@mui/material';
import { ChipContainer } from '../../components/ui/chips-container';
import CollapsibleSection from '../../components/ui/collapsible-section';
import { style } from '../../components/ui/helper-styles';
import x from '@stylexjs/stylex';
import { useContext, useState } from 'react';
import { TestContext } from '../../contexts/test-context';

const s = x.create({
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
});


export const SettingsOptions = () => {
    const theme = useTheme();

    const {
        suiteConfig,
        changeName,
        changeViewport,
        selectedName,
        selectedViewport,
    } = useContext(TestContext);

    const [ targettedSelectionOpen, setTargettedSelectionOpen ] = useState(false);

    const parsedViewports = suiteConfig?.viewports?.map(viewport => {
        if (Array.isArray(viewport)) return viewport.join(',');
        return viewport;
    });


    return (
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
    )
}
