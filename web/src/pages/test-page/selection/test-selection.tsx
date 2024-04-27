import { TestOption } from './test-option';
import x from '@stylexjs/stylex';
import { TargettedTestSettings } from './targetted-test-settings/targetted-test-settings';
import { useContext } from 'react';
import { TestContext } from '../../../contexts/test-context';

const s = x.create({
    cardsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        minWidth: '320px',
    },
});

export const TestSelection = () => {
    const { images } = useContext(TestContext);

    const diffsCount = images.diffList.length;

    return (
        <div {...x.props(s.cardsContainer)}>
            <TestOption
                title='Full'
                description='Run a full visual regression test of all endpoints and viewports'
                // body='Previous diffs are deleted but restored in case they fail/are skipped'
                testType='full-test'
            />

            <TestOption
                title='Diffs only'
                description={`Re-test all the diffs in the suite (${diffsCount})`}
                testType='diffs-only'
                disabled={diffsCount === 0}
            />

            <TestOption
                title='Targetted'
                description='Run a test of a specific endpoint and/or viewport'
                testType='targetted'
            >
                <TargettedTestSettings />
            </TestOption>
        </div>   
    )
}
