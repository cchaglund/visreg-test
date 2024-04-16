import React from 'react';
import { ColorModeContext } from '../../contexts/theme-context';
import { useTheme } from '@mui/material/styles';
import { AppBar, Button, IconButton, Toolbar } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Menu from './menu';
import stylex from '@stylexjs/stylex';
import { AppContext } from '../../contexts/app-context';
import { Link, useLocation } from 'react-router-dom';
import BreadcrumbsComponent from './breadcrumbs';

const s = stylex.create({
    menuContainer: {
        marginRight: '1rem',
        display: 'flex',
        alignItems: 'center',
    },
    nameContainer: {
        flexGrow: 1,
        display: 'flex',
    },
    backToAssessment: {
        margin: '0 auto',
        flexGrow: 1,
    }
});

const Header = () => {
    const theme = useTheme();
    const colorMode = React.useContext(ColorModeContext);
    const { currentDiffIndex } = React.useContext(AppContext);
    const location = useLocation();

    return (
        <AppBar position="static" color='transparent' sx={{ p: 1, width: '100%', zIndex: 2 }}>
            <Toolbar>
                <div {...stylex.props(s.menuContainer)}>
                    <Menu />
                </div>
                <div {...stylex.props(s.nameContainer)}>
                    <BreadcrumbsComponent />
                </div>

                {!location.pathname.includes('/assessment') && currentDiffIndex !== null && (
                    <Link to='/assessment' {...stylex.props(s.backToAssessment)}>
                        <Button variant="contained" color="error">
                            Back to ongoing assessment
                        </Button>
                    </Link>
                )}
                <IconButton
                    sx={{ ml: 1 }}
                    onClick={() => colorMode.toggleColorMode()}
                    color="primary"
                >
                    {theme.palette.mode === 'dark'
                        ? <Brightness7Icon />
                        : <Brightness4Icon />
                    }
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
