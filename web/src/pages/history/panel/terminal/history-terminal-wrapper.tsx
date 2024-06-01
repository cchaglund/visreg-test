import HistoryTerminal from './history-terminal';
import { Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import CollapsibleSection from '../../../../components/ui/collapsible-section';
import { useState } from 'react';

const s = x.create({
    terminalContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: x.firstThatWorks('-webkit-fill-available', 'moz-available', '100%'),
        margin: '0 auto',
        backgroundColor: '#0B2027',
        padding: '2rem',
        transition: 'box-shadow 0.2s',
        marginBlock: '2rem',
        borderRadius: '1rem',
        maxWidth: '1100px',
    },
    terminalContainerHover: {
        cursor: 'pointer',
        ':hover': {
            boxShadow: 'rgba(0, 0, 0, 0.6) 0px 7px 10px -3px',
        },
    },
});

export const HistoryTerminalWrapper = (props: { terminalOutput: (string | React.ReactElement)[] }) => {
    const [ terminalViewOpen, setTerminalViewOpen ] = useState(false);

    const toggleTerminalOpen = () => {        
        setTerminalViewOpen(prev => !prev);
    };

    return (
        <div
            {...x.props(
                s.terminalContainer, 
                !terminalViewOpen && s.terminalContainerHover,
            )}
            onClick={() => !terminalViewOpen ? toggleTerminalOpen() : null}
        >
            <CollapsibleSection
                heading={(
                    <Typography variant="h6" color={'#FCF7F8'}>
                        Logs
                    </Typography>
                )}
                duration={300}
                initialExpanded={terminalViewOpen}
                parentState={terminalViewOpen}
                parentToggle={() => !terminalViewOpen ? null : toggleTerminalOpen()}
                overflowContentX={true}
            >
                <HistoryTerminal terminalOutput={props.terminalOutput} />
            </CollapsibleSection>
        </div>
    );
};
