import { ColorModeContext } from '../../contexts/theme-context';
import { useTheme } from '@mui/material/styles';
import { Alert, AppBar, Box, Button, Dialog, DialogContent, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Menu from './menu';
import x from '@stylexjs/stylex';
import { AppContext } from '../../contexts/app-context';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BreadcrumbsComponent from './breadcrumbs';
import { style } from '../ui/helper-styles';
import { useContext, useState } from 'react';

const s = x.create({
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
    const location = useLocation();
    const navigate = useNavigate();
    const colorMode = useContext(ColorModeContext);
    const { currentDiffIndex, setCurrentDiffIndex, suiteName } = useContext(AppContext);
    const [ showModal, setShowModal ] = useState(false);
    const [ typeOfEnd, setTypeOfEnd ] = useState('');

    const endAssessment = async (action: 'finish' | 'abandon') => {
        setTypeOfEnd(action);
        setShowModal(true);
    };

    const abandonAssessment = () => {
        setShowModal(false);
        navigate('/suite/' + suiteName);      
        setCurrentDiffIndex(null);
    };

    const finishAssessment = async () => {
        setShowModal(false);
        setCurrentDiffIndex(null);
        navigate('/summary');
    };


    return (
        <AppBar position="static" color='transparent' sx={{ p: 1, width: '100%', zIndex: 2 }}>
            <Toolbar>
                <div {...x.props(s.menuContainer)}>
                    <Menu />
                </div>
                <div {...x.props(s.nameContainer)}>
                    <BreadcrumbsComponent />
                </div>

                <Dialog onClose={() => setShowModal(false)} open={showModal}>
                    <DialogContent>
                        <Box
                            component="div"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                m: 'auto',
                                width: 'fit-content',
                                p: 1,
                            }}
                        >
                            {typeOfEnd === 'finish' && (
                                <div {...x.props(style.flexColumn, style.gap2)}>
                                    <Alert severity="warning">
                                        <Typography variant='body1'>
                                            Not all diffs have been assessed.
                                        </Typography>
                                    </Alert>
                                    <Typography variant="h6">
                                        Update baselines with any approved diffs and finish assessment early?
                                    </Typography>
                                    <Typography variant="body2">
                                        Any rejected diffs can be assessed again later, as usual.
                                    </Typography>
                                    <div {...x.props(style.flex, style.gap1, style.mlAuto)}>
                                        <Button variant="contained" color="primary" onClick={() => finishAssessment()}>
                                            Finish
                                        </Button>
                                        <Button variant="text" color="secondary" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {typeOfEnd === 'abandon' && (
                                <div {...x.props(style.flexColumn, style.gap2)}>
                                    <Alert severity="warning">
                                        <Typography variant='body1'>
                                            Baselines will <u>not</u> be updated with any approved diffs.
                                        </Typography>
                                    </Alert>
                                    <Typography variant="h6">
                                        Discard any approved diffs and abandon assessment?
                                    </Typography>
                                    <div {...x.props(style.flex, style.gap1, style.mlAuto)}>
                                        <Button variant="contained" color="primary" onClick={() => abandonAssessment()}>
                                            Abandon
                                        </Button>
                                        <Button variant="text" color="secondary" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Box>
                    </DialogContent>
                </Dialog>

                {currentDiffIndex !== null && (
                    <div {...x.props(style.flex, style.gap1, s.backToAssessment, style.alignCenter)}>
                        <Typography variant="body1" color="text.primary">
                            Assessment in progress:
                        </Typography>

                        {!location.pathname.includes('/assessment') && (
                            <Link to={`/suite/${suiteName}/assessment/?resume=true`}>
                                <Tooltip title="Return to the ongoing assessment">
                                    <Button variant="contained" color="primary">
                                        Resume
                                    </Button>
                                </Tooltip>
                            </Link>
                        )}

                        <Tooltip title="Update baselines for any approved diffs (rejected diffs can be assessed later)">
                            <Button variant="contained" color="secondary" onClick={() => endAssessment('finish')}>
                                Finish
                            </Button>
                        </Tooltip>

                        <Tooltip title="Discard any approved diffs and stop assessing">
                            <Button variant="outlined" color="secondary" onClick={() => endAssessment('abandon')}>
                                Abandon
                            </Button>
                        </Tooltip>
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
