import { useContext } from 'react';
import { TestContext } from '../../contexts/test-context';
import Terminal from './terminal';
import CollapsibleSection from '../ui/collapsible-section';
import { Typography } from '@mui/material';
import x from '@stylexjs/stylex';

const s = x.create({
    terminalContainer: {
        width: '-webkit-fill-available',
        margin: '0 auto',
        backgroundColor: '#0B2027',
        padding: '2rem',
        transition: 'box-shadow 0.2s',
        marginBottom: '3rem',
        marginTop: '4rem',
        borderRadius: '1rem',
    },
    terminalContainerHover: {
        ':hover': {
            boxShadow: 'rgba(0, 0, 0, 0.6) 0px 7px 10px -3px',
        },
    },
});

export const TerminalWrapper = () => {
    const {
        terminalViewOpen,
        toggleTerminalOpen,
        terminalRef,
    } = useContext(TestContext);

    return (
        <div {...x.props(
            s.terminalContainer,
            !terminalViewOpen && s.terminalContainerHover
        )}>
            <CollapsibleSection
                heading={(
                    <Typography variant="h6" color={'#FCF7F8'}>
                        Terminal
                    </Typography>)
                }
                duration={300}
                initialExpanded={terminalViewOpen}
                parentState={terminalViewOpen}
                parentToggle={() => toggleTerminalOpen()}
            >
                <Terminal />
            </CollapsibleSection>
            <div ref={terminalRef} />
        </div>
    );
};
