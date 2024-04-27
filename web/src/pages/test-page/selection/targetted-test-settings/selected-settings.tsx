import { ArticleTwoTone } from '@mui/icons-material';
import VrpanoTwoToneIcon from '@mui/icons-material/VrpanoTwoTone';
import { Chip } from '@mui/material';
import { useContext } from 'react';
import { ChipContainer } from '../../../../components/ui/chips-container';
import { style } from '../../../../components/ui/helper-styles';
import { TestContext } from '../../../../contexts/test-context';
import x from '@stylexjs/stylex';

export const SelectedSettings = () => {
    const { selectedTargetEndpoints, selectedTargetViewports } = useContext(TestContext);

    if (!selectedTargetEndpoints && !selectedTargetViewports) return null;

    return (
        <div {...x.props(style.mb2)}>
            <ChipContainer>
                {selectedTargetEndpoints.map((endpoint, index) => (
                    <Chip label={endpoint} color='secondary' icon={<ArticleTwoTone />} key={index} />
                ))}

                {selectedTargetViewports.map((viewport, index) => (
                    <Chip label={viewport} color='secondary' icon={<VrpanoTwoToneIcon />} key={index} />
                ))}
            </ChipContainer>
        </div>
    );
};
