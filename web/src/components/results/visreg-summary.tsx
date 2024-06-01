import { Chip, Tooltip } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import NumbersTwoToneIcon from '@mui/icons-material/NumbersTwoTone';
import SkipNextTwoToneIcon from '@mui/icons-material/SkipNextTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
import BiotechTwoToneIcon from '@mui/icons-material/BiotechTwoTone';
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import { SummaryPayload } from '../../contexts/test-context';
import { ChipContainer } from '../ui/chips-container';
import { ResultsColumn } from './results-column';

export const VisregSummary = (props: { visregSummary: SummaryPayload}) => {
    const { visregSummary } = props;

    if (!visregSummary) return null;

    const { cypressSummary } = visregSummary;

    const diffsCount = visregSummary.testDiffList.length || 0;

    const { failing, skipped, unchanged } = visregSummary.endpointTestResults;
    

    return (
        <ResultsColumn heading={'Summary'}>

            <ChipContainer flexColumn>
                <Tooltip title="Date & time when run" placement='top'>
                    <Chip icon={<CalendarMonthTwoToneIcon />} label={
                        `${new Date(visregSummary.createdAt).toLocaleString()}`
                    } />
                </Tooltip>

                <Tooltip title="Type of test" placement='top'>
                    <Chip icon={<BiotechTwoToneIcon />} label={
                        `"${visregSummary.testType}"`
                    } />
                </Tooltip>

                <Tooltip title="Duration of test run" placement='top'>
                    <Chip icon={<AccessTimeTwoToneIcon />} label={
                        `${cypressSummary.duration}s`
                    } />
                </Tooltip>

                <Chip icon={<NumbersTwoToneIcon />} label={
                    `Total: ${cypressSummary.tests}`
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
