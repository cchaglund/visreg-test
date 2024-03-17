import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import React from 'react';

export const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

export function ColorContext(props: { children: React.ReactNode; }) {
    const [ mode, setMode ] = React.useState<'light' | 'dark'>('light');
    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [ mode ],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {props.children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
