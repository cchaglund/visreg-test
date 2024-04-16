import { TestActionCard } from './test-action-card';
import x from '@stylexjs/stylex';
import { TargettedTestSettings } from './targetted-test-settings';

const s = x.create({
    cardsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        minWidth: '320px',
    },
});

export const TestTypeActions = () => {
    return (
        <div {...x.props(s.cardsContainer)}>
            <TestActionCard
                title='Full'
                description='Run a full visual regression test of all endpoints and viewports (previous diffs are deleted)'
                testType='full-test'
            />

            <TestActionCard
                title='Diffs only'
                description='Run a test of only the endpoints and viewports with existing diffs'
                testType='diffs-only'
            />

            <TestActionCard
                title='Targetted'
                description='Run a test of a specific endpoint and/or viewport'
                testType='targetted'
            >
                <TargettedTestSettings />
            </TestActionCard>
        </div>   
    )
}
