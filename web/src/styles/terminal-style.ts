import x from '@stylexjs/stylex';

export const terminalStyles = x.create({
    terminal: {
        backgroundColor: '#0B2027',
        color: '#FCF7F8',
        height: '700px',
        overflowY: 'scroll',
        overflowX: 'scroll',
        fontFamily: 'monospace',
        width: '100%',
        maxWidth: '-webkit-fill-available',
        margin: '0 auto',
        marginBottom: '2rem',
        '@media (max-width: 900px)': {
            fontSize: '0.7rem',
        },
        '@media (max-width: 600px)': {
            fontSize: '0.5rem',
        },
    },
    log: {
        margin: 0,
    },
});
