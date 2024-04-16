import { Chip, Typography } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import NumbersTwoToneIcon from '@mui/icons-material/NumbersTwoTone';
import SkipNextTwoToneIcon from '@mui/icons-material/SkipNextTwoTone';
import { ChipContainer } from '../../components/ui/chips-container';
import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';

export const TestSummary = () => {
    const { summaryState } = useContext(TestContext);

    if (!summaryState) return null;

    return (
        <div>
            <Typography variant='h5' color={'text.primary'}mb={3}>
                Summary
            </Typography>

            <ChipContainer flexColumn>
                <Chip icon={<NumbersTwoToneIcon />} label={
                    `Total: ${summaryState.tests}`
                }/>

                <Chip  icon={<AccessTimeTwoToneIcon />} label={
                    `Duration: ${summaryState.duration}s`
                }/>

                {summaryState.skipped ? (
                    <Chip icon={<SkipNextTwoToneIcon />} label={
                        `Skipped: ${summaryState.skipped}`
                    }/>
                ) : null}

                <Chip color='success' icon={<Check />} label={
                    `Ran: ${summaryState.passing}`
                }/>

                {summaryState.failing ? (
                    <Chip color='error' icon={<Close />} label={
                        `Failed to run: ${summaryState.failing}`}
                    />
                ) : null}
            </ChipContainer>

        </div>
    );
};
