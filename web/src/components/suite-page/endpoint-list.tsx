import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Endpoint } from './suite-page';
import stylex from '@stylexjs/stylex';

const s = stylex.create({
    list: {
        width: '100%',
        minWidth: '800px',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '12px',
    },
});

const EndpointItem = (props: { row: Endpoint; }) => {
    const { row } = props;
    const [ open, setOpen ] = React.useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, borderBottom: open ? '1px solid rgba(0,0,0,0.5)' : 'unset' }}>
                <TableCell width={40}>
                    {Object.keys(row).length > 2 && (
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.title}
                </TableCell>
                <TableCell>{row.path}</TableCell>
            </TableRow>
            {Object.keys(row).length > 2 && (
                <TableRow>
                    <TableCell style={{ padding: 0, paddingLeft: '1.5rem', background: 'rgba(0,0,0,0.03)' }} colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box>
                                <TableContainer>
                                    <Table aria-label="collapsible table" size='small' sx={{marginTop: 1}}>
                                        <TableBody>
                                            {Object.entries(row)
                                                .filter(([key]) => key !== 'title' && key !== 'path')
                                                .map(([key, value]) => {
                                                    return (
                                                        <TableRow key={key}>
                                                            <TableCell width={40}/>
                                                            <TableCell component="th" scope="row" sx={{ textTransform: 'capitalize'}}>
                                                                {key}
                                                            </TableCell>
                                                            <TableCell>{value}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}


type EndpointsListProps = {
    endpoints?: Endpoint[];
};

const EndpointsList = (props: EndpointsListProps) => {
    const { endpoints } = props;

    if (!endpoints) {
        return null;
    }

    return (
        <React.Fragment>
            <Typography variant="h6" mb={3}>Endpoints</Typography>
            <TableContainer {...stylex.props(s.list)}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell width={40}/>
                            <TableCell>Title</TableCell>
                            <TableCell>Path</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {endpoints.map((endpoint) => (
                            <EndpointItem key={endpoint.title} row={endpoint} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>
    );
};

export default EndpointsList;
