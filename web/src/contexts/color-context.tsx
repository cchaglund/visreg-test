import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import React from 'react';

export const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

export function ColorContext(props: { children: React.ReactNode; }) {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [ mode, setMode ] = React.useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
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
                    text: {
                        primary: mode === 'light' ? '#272727' : '#FCF7F8',
                        secondary: mode === 'light' ? '#0B2027' : '#FBF2EF',
                    },
                    background: {
                        default: mode === 'light' ? '#FCF7F8' : '#061418',
                        paper: mode === 'light' ? '#FBF2EF' : '#0B2027',
                    },
                    primary: {
                        main: mode === 'light' ? '#CF5C36' : '#C95731',
                    },
                    secondary: {
                        main: mode === 'light' ? '#555B6E' : '#9297AB',
                    },
                    info: {
                        main: mode === 'light' ? '#58a4b0' : '#4E9BA6',
                    },
                    success: {
                        main: mode === 'light' ? '#749C75' : '#638C64',
                    },
                    warning: {
                        main: mode === 'light' ? '#faa916' : '#EB9A05',
                    },
                    error: {
                        main: mode === 'light' ? '#c81d25' : '#E2363F',
                    },
                    common: {
                        black: mode === 'light' ? '#0B2027' : '#D7EDF4',
                        white: mode === 'light' ? '#FCF7F8' : '#070304',
                    },
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
