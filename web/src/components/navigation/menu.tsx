import * as React from 'react';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import {
    Check as CheckmarkIcon,
    Close as CloseIcon,
    CallReceived as CallReceivedIcon,
    Menu as MenuIcon,
    Home as HomeIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import stylex from '@stylexjs/stylex';
import { 
    AppBar,
    Box,
    Button,
    Collapse,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from '@mui/material';

const drawer = stylex.create({
    closeDrawerContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        padding: '0',
    },
    closeIcon: {
        marginLeft: '-0.5rem',
    },
    openDrawerContainer: {
        marginLeft: '-0.5rem',
        minWidth: '0',
    }
});

export type ProjectInformationData = {
    projectInformation: {
        suites: string[];
    }
}

export default function Menu() {
    const [ open, setOpen ] = React.useState(false);
    const [ expanded, setExpanded ] = React.useState('');
    const { projectInformation } = useLoaderData() as ProjectInformationData;
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const expandNested = (suite: string) => {
        if (expanded === suite) {
            setExpanded('');
            return;
        }

        setExpanded(suite);
    };

    const navigateTo = (path: string) => {
        setOpen(false);
        navigate(path);
    }

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" component={'nav'}>
            <Button {...stylex.props(drawer.closeDrawerContainer)} onClick={toggleDrawer(false)}>
                <AppBar position="static" color='transparent' sx={{ p: 1, width: '100%', zIndex: 2 }}>
                    <Toolbar>
                            <CloseIcon fontSize='large' {...stylex.props(drawer.closeIcon)} />
                    </Toolbar>
                </AppBar>
            </Button>
            <Divider />
            <List>
                <ListItem key={'home'} disablePadding>
                    <ListItemButton
                        onClick={() => navigateTo('/')}
                        selected={location.pathname === '/'}
                    >
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Home'} />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                {projectInformation?.suites?.map((suite, index) => (
                    <div key={index}>
                        <ListItemButton onClick={() => expandNested(suite)} key={suite}>
                            <ListItemText primary={suite} />
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={expanded === suite} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>

                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() => navigateTo(`/suite/${suite}`)}
                                    selected={location.pathname === `/suite/${suite}`}
                                >
                                    <ListItemIcon>
                                        <HomeIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Suite" />
                                </ListItemButton>

                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() => navigateTo(`/suite/${suite}/files/baseline`)}
                                    selected={location.pathname === `/suite/${suite}/files/baseline`}
                                >
                                    <ListItemIcon>
                                        <CheckmarkIcon color='success' />
                                    </ListItemIcon>
                                    <ListItemText primary="Baselines" />
                                </ListItemButton>

                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() => navigateTo(`/suite/${suite}/files/diff`)}
                                    selected={location.pathname === `/suite/${suite}/files/diff`}
                                >
                                    <ListItemIcon>
                                        <CloseIcon color='error' />
                                    </ListItemIcon>
                                    <ListItemText primary="Diffs" />
                                </ListItemButton>

                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() => navigateTo(`/suite/${suite}/files/received`)}
                                    selected={location.pathname === `/suite/${suite}/files/received`}
                                >
                                    <ListItemIcon>
                                        <CallReceivedIcon color='warning' />
                                    </ListItemIcon>
                                    <ListItemText primary="Received" />
                                </ListItemButton>
                                
                            </List>
                        </Collapse>
                    </div>
                ))}
            </List>
        </Box>
    );

    return (
        <React.Fragment>
            <Button onClick={toggleDrawer(true)} {...stylex.props(drawer.openDrawerContainer)}>
                <MenuIcon fontSize='large' />
            </Button>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </React.Fragment>
    );
}
