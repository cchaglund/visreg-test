import { useContext } from 'react';
import Terminal from './terminal';
import { Button, Typography } from '@mui/material';
import x from '@stylexjs/stylex';
import CollapsibleSection from '../../../../components/ui/collapsible-section';
import { TestContext } from '../../../../contexts/test-context';

const s = x.create({
    terminalContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: x.firstThatWorks('-webkit-fill-available', 'moz-available', '100%'),
        margin: '0 auto',
        backgroundColor: '#0B2027',
        padding: '2rem',
        transition: 'box-shadow 0.2s',
        marginTop: '4rem',
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

export const TerminalWrapper = () => {
    const {
        terminalViewOpen,
        toggleTerminalOpen,
        terminalRef,
        initiateTerminationOfTest,
        testStatus,
    } = useContext(TestContext);

    const TerminateProcessButton = () => {

        if (testStatus === 'terminating') {
            return (
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{ marginLeft: 'auto' }}
                >
                    Stopping...
                </Button>
            )
        }

        return (
            <Button
                variant="contained"
                color="secondary"
                sx={{ marginLeft: 'auto' }}
                onClick={() => {
                    initiateTerminationOfTest();
                }}
            >
                Stop test
            </Button>
        );
    };

    const TerminalHeading = () => {
        return (
            <Typography variant="h6" color={'#FCF7F8'}>
                Terminal
            </Typography>
        );
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
                heading={<TerminalHeading />}
                duration={300}
                initialExpanded={terminalViewOpen}
                parentState={terminalViewOpen}
                parentToggle={() => !terminalViewOpen ? null : toggleTerminalOpen()}
                overflowContentX={true}
            >
                <Terminal />
            </CollapsibleSection>

            {testStatus === 'running' || testStatus === 'terminating' ? <TerminateProcessButton /> : null}

            <div ref={terminalRef} />

        </div>
    );
};
