import { useEffect, useState } from 'react';
import { Collapse, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { style } from './helper-styles';


type CollapsibleSectionProps = {
    heading: string | React.ReactNode;
    children: React.ReactNode;
    initialExpanded?: boolean;
    parentToggle?: () => void;
    parentState?: boolean;
    duration?: number;
    overflowContentX?: boolean;
};

const s = x.create({
    overflowXAuto: {
        overflowX: 'auto',
    },
});

const CollapsibleSection = (props: CollapsibleSectionProps) => {
    const { heading, children, initialExpanded, parentToggle, parentState, duration, overflowContentX } = props;

    const [ expanded, setExpanded ] = useState(parentState ? parentState : initialExpanded ?? false);

    useEffect(() => {
        if (parentState === undefined) return;
        setExpanded(parentState);
    }, [ parentState ]);

    return (
        <div>
            <div
                {...x.props(style.flex, style.gap1, style.alignCenter, style.cursorPointer)}
                onClick={() => {
                    if (parentToggle) {
                        parentToggle();
                    } else {
                        setExpanded(!expanded);
                    }
                }}
            >
                {typeof heading === 'string' ? (
                    <Typography variant="h6" color='text.primary'>
                        {heading}
                    </Typography>
                ) : heading}

                {expanded ? <ExpandLess color='primary' /> : <ExpandMore color='primary' />}
            </div>
            <div {...x.props(style.flex, style.gap1, style.alignCenter, overflowContentX && s.overflowXAuto)}>
                <Collapse in={expanded} timeout={duration ?? 'auto'}>
                    <div {...x.props(style.mt1)}>
                        {children}
                    </div>
                </Collapse>
            </div>
        </div>
    );
};

export default CollapsibleSection;
