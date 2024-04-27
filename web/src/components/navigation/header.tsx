import { ColorModeContext } from '../../contexts/theme-context';
import { useTheme } from '@mui/material/styles';
import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Menu from './menu';
import stylex from '@stylexjs/stylex';
import { AppContext } from '../../contexts/app-context';
import { Link, useLocation } from 'react-router-dom';
import BreadcrumbsComponent from './breadcrumbs';
import { style } from '../ui/helper-styles';
import { useContext } from 'react';

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
    const colorMode = useContext(ColorModeContext);
    const { currentDiffIndex, setCurrentDiffIndex, suiteName } = useContext(AppContext);
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
                    <div {...stylex.props(style.flex, style.gap1, s.backToAssessment, style.alignCenter)}>
                        <Typography variant="h6" color="text.primary">
                            Ongoing assessment
                        </Typography>

                        <Link to={'/assessment/' + suiteName}>
                            <Button variant="contained" color="primary">
                                Continue
                            </Button>
                        </Link>

                        <Button variant="outlined" color="secondary" onClick={() => setCurrentDiffIndex(null)}>
                            Abandon
                        </Button>

                    </div>
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
