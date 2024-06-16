import { Button, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import RawFilePanel from '../../../components/ui/raw-file';
import CollapsibleSection from '../../../components/ui/collapsible-section';
import FileOpenTwoToneIcon from '@mui/icons-material/FileOpenTwoTone';
import { useContext } from 'react';
import { SuiteContext } from '../suite-page';
import { style } from '../../../components/ui/helper-styles';
import CachedTwoToneIcon from '@mui/icons-material/CachedTwoTone';
import { bustSuiteConfigCache } from '../../../loaders-and-fetchers';

const s = x.create({
    leftAreaSection: {
        marginBottom: '2rem',
    },
    leftArea: {
        width: '400px',
    },
    flexContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    wrap: {
        flexWrap: 'wrap',
    },
});

const SuiteDetailsSidebar = () => {
    const { suiteConfig } = useContext(SuiteContext);

    const reloadSuiteData = async () => {
        const res = await bustSuiteConfigCache(suiteConfig!.suiteSlug);
        if (!res) return;
        window.location.reload();
    }

    return (
        <div {...x.props(s.leftArea)}>
            {suiteConfig?.files.length && (
                <div {...x.props(s.leftAreaSection)}>
                    <Typography variant="h6" mb={1} color='text.primary'>
                        Files
                    </Typography>
                    <div {...x.props(s.flexContainer, s.wrap)}>
                        {suiteConfig?.files.map((file, index) => (
                            <a
                                href={suiteConfig?.fileEndpoint + file}
                                target='_blank'
                                rel='noreferrer'
                                key={index}
                            >
                                <Button
                                    variant='text'
                                    color='primary'
                                    startIcon={<FileOpenTwoToneIcon />}
                                    key={index}
                                >
                                    {file.charAt(0).toUpperCase() + file.slice(1)}
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div {...x.props(style.mb2)}>
                <CollapsibleSection heading={'Directory'}>
                    <Typography variant="body2" mb={1} color='text.primary'>
                        {suiteConfig?.directory}
                    </Typography>
                    <RawFilePanel path={suiteConfig?.directory} />
                </CollapsibleSection>
            </div>

            <div {...x.props(style.mb2)}>
                <CollapsibleSection heading={'Page visit code'}>
                    <Typography variant="body2"  color='text.primary'>
                        {suiteConfig?.onVisit}
                    </Typography>
                </CollapsibleSection>
            </div>

            <div {...x.props(style.mb2)}>
                <CollapsibleSection heading={'Format URL'}>
                    <Typography variant="body2"  color='text.primary'>
                        {suiteConfig?.formatUrl}
                    </Typography>
                </CollapsibleSection>
            </div>
            <div {...x.props(style.mb2)}>
                <CollapsibleSection heading={'Reload suite data'}>
                    <Typography variant="body2" mb={1} color='text.primary'>
                        Suite data is cached for optimization. Click below to force-reload suite data.
                    </Typography>
                    <Button
                        variant='outlined' color="secondary"
                        size='small'
                        startIcon={<CachedTwoToneIcon />}
                        onClick={() => reloadSuiteData()}
                    >
                        Reload
                    </Button>                
                </CollapsibleSection>
            </div>
        </div>
    );
};

export default SuiteDetailsSidebar;
