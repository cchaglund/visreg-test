import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { Endpoint } from './suite-page';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Chip } from '@mui/material';
import x from '@stylexjs/stylex';

const s = x.create({
    chipsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
});

const EndpointListItem = (props: { row: Endpoint; }) => {
    const { row } = props;
    const [ open, setOpen ] = React.useState(false);

    if (!row) {
        return null;
    }

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, borderBottom: open ? '1px solid rgba(0,0,0,0.5)' : 'unset' }}>
                <TableCell sx={{ width: 0 }} padding="checkbox">
                    {Object.keys(row).length > 2 && (
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                            key={row.title}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.title}
                </TableCell>
                <TableCell>
                    {row.path}
                </TableCell>
                <TableCell {...x.props(s.chipsContainer)}>
                    {Object.entries(row)
                        .filter(([ key ]) => key !== 'title' && key !== 'path')
                        .map(([ key ]) => <Chip key={key} label={key} variant='filled' />
                        )}
                </TableCell>
            </TableRow>
            {Object.keys(row).length > 2 && (
                <TableRow>
                    <TableCell style={{ padding: 0, paddingLeft: '0.2rem', background: 'rgba(0,0,0,0.03)' }} colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box>
                                <TableContainer>
                                    <Table aria-label="collapsible table" size='small' sx={{ marginTop: 1 }}>
                                        <TableBody>
                                            {Object.entries(row)
                                                .filter(([ key ]) => key !== 'title' && key !== 'path')
                                                .map(([ key, value ]) => {
                                                    return (
                                                        <TableRow key={key}>
                                                            <TableCell sx={{ width: 0 }} padding="checkbox" />
                                                            <TableCell component="th" scope="row" sx={{ textTransform: 'capitalize' }}>
                                                                {key}
                                                            </TableCell>
                                                            <TableCell>{
                                                                // Stringify values
                                                                !Array.isArray(value) && typeof value === 'object'
                                                                    ? JSON.stringify(value)
                                                                    : value.toString()
                                                            }</TableCell>
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
};

export default EndpointListItem;