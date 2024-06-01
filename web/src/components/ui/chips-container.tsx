import x from '@stylexjs/stylex';
import { style } from './helper-styles';

const s = x.create({
    chipContainer: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        cursor: 'default',
    },
});

export const ChipContainer = (props: { children: React.ReactNode; flexColumn?: boolean; }) => (
    <div {...x.props(
        s.chipContainer,
        props.flexColumn && style.flexColumn,
        props.flexColumn && style.alignStart
    )}>
        {props.children}
    </div>
);
