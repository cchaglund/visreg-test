import { Chip } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import NumbersTwoToneIcon from '@mui/icons-material/NumbersTwoTone';
import SkipNextTwoToneIcon from '@mui/icons-material/SkipNextTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
import BiotechTwoToneIcon from '@mui/icons-material/BiotechTwoTone';
import { ChipContainer } from '../../../../components/ui/chips-container';
import { useContext } from 'react';
import { TestContext } from '../../../../contexts/test-context';
import { ResultsColumn } from './results-column';

export const TestSummary = () => {
    const { cypressSummaryState, visregSummary } = useContext(TestContext);

    if (!cypressSummaryState || !visregSummary) return null;

    const diffsCount = visregSummary.testDiffList.length || 0;

    const { failing, skipped, unchanged } = visregSummary.endpointTestResults;
    

    return (
        <ResultsColumn heading={'Summary'}>

            <ChipContainer flexColumn>
                <Chip icon={<BiotechTwoToneIcon />} label={
                    `Test: ${visregSummary.testType}`
                } />

                <Chip icon={<AccessTimeTwoToneIcon />} label={
                    `Duration: ${cypressSummaryState.duration}s`
                } />

                <Chip icon={<NumbersTwoToneIcon />} label={
                    `Total: ${cypressSummaryState.tests}`
                } />

                {unchanged.length > 0 && (
                    <Chip color='success' icon={<Check />} label={
                        `Unchanged: ${unchanged.length}`
                    } />
                )}

                {diffsCount > 0 && (
                    <Chip color='warning' icon={<Close />} label={
                        `Diffs: ${diffsCount}`
                    } />
                )}

                {skipped.length > 0 && (
                    <Chip color='info' icon={<SkipNextTwoToneIcon />} label={
                        `Skipped: ${skipped.length}`
                    } />
                )}

                {failing.length > 0 && (
                    <Chip color='error' icon={<ErrorTwoToneIcon />} label={
                        `Failed: ${failing.length}`}
                    />
                )}
            </ChipContainer>

        </ResultsColumn>
    );
};
