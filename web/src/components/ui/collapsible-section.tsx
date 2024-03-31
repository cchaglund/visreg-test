import { useState } from 'react';
import { Collapse, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import { ExpandLess, ExpandMore } from '@mui/icons-material';


const s = x.create({
    expandableArea: {
        marginBottom: '2rem',
        cursor: 'pointer',
    },
    flexContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    mt1: {
        marginTop: '1rem',
    },
    mt2: {
        marginTop: '2rem',
    },
});

type CollapsibleSectionProps = {
    heading: string;
    children: React.ReactNode;
    initialExpanded?: boolean;
};

const CollapsibleSection = ({ heading, children, initialExpanded }: CollapsibleSectionProps) => {
    const [ expanded, setExpanded ] = useState(initialExpanded ?? false);    

    return (
        <div {...x.props(s.expandableArea)}>
            <div
                {...x.props(s.flexContainer)}
                onClick={() => setExpanded(!expanded)}
            >
                <Typography variant="h6" color='text.primary'>
                    {heading}
                </Typography>
                {expanded ? <ExpandLess color='primary' /> : <ExpandMore color='primary' />}
            </div>
            <div
                {...x.props(
                    s.flexContainer,
                )}
            >
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <div {...x.props(s.mt1)}>
                        {children}
                    </div>
                </Collapse>
            </div>
        </div>
    );
};

export default CollapsibleSection;
