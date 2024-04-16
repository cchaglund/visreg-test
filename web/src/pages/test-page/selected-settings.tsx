import { ArticleTwoTone } from '@mui/icons-material';
import VrpanoTwoToneIcon from '@mui/icons-material/VrpanoTwoTone';
import { Chip } from '@mui/material';
import { useContext } from 'react';
import { ChipContainer } from '../../components/ui/chips-container';
import { style } from '../../components/ui/helper-styles';
import { TestContext } from '../../contexts/test-context';
import x from '@stylexjs/stylex';

export const SelectedSettings = () => {
    const { selectedName, selectedViewport } = useContext(TestContext);

    if (!selectedName && !selectedViewport) return null;

    return (
        <div {...x.props(style.mb2)}>
            <ChipContainer>
                {selectedName && (
                    <Chip label={selectedName} color='secondary' icon={<ArticleTwoTone />} />
                )}

                {selectedViewport && (
                    <Chip label={selectedViewport} color='secondary' icon={<VrpanoTwoToneIcon />} />
                )}
            </ChipContainer>
        </div>
    );
};
