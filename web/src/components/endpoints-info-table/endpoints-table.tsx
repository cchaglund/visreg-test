import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Endpoint } from '../../types';
import EndpointListItem from './endpoint-item';
import { Paper } from '@mui/material';

type EndpointsListProps = {
    endpoints?: Endpoint[];
};

const EndpointsTable = (props: EndpointsListProps) => {
    const { endpoints } = props;

    if (!endpoints) {
        return null;
    }

    return (
        <React.Fragment>
            <TableContainer component={Paper} elevation={2} sx={{ width: '100%', minWidth: '400px', borderRadius: '0.75rem' }}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 0 }} padding="normal" />
                            <TableCell>Title</TableCell>
                            <TableCell>Path</TableCell>
                            <TableCell>Attributes</TableCell>
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

export default EndpointsTable;
