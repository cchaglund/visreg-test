import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Endpoint } from './suite-page';
import stylex from '@stylexjs/stylex';
import EndpointListItem from './endpoint-item';

const s = stylex.create({
    list: {
        width: '100%',
        minWidth: '400px',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '12px',
    },
});

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
            <TableContainer {...stylex.props(s.list)}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: 0}} padding="normal"/>
                            <TableCell>Title</TableCell>
                            <TableCell>Path</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {endpoints.map((endpoint, index) => (
                            <EndpointListItem key={index} row={endpoint} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>
    );
};

export default EndpointsList;
