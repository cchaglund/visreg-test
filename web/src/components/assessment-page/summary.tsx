import Button from '@mui/material/Button';
import { Typography, List, ListItem, Divider, CircularProgress, Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import {
    useLoaderData,
    useNavigate,
} from 'react-router-dom';

export type SummaryType = {
    approvedFiles: string[];
    rejectedFiles: string[];
    duration: number;
    failed: boolean;
};

const listStyle = {
    py: 0,
    width: '100%',
    maxWidth: 360,
};

const summaryStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem',
    bgcolor: 'background.default',
};

type SummaryData = {
    summary: SummaryType;
};


const Summary = () => {
    const { summary } = useLoaderData() as SummaryData;
    const navigate = useNavigate();

    const FilesList = ({ files, title }: { files: string[]; title: string; }) => (
        <div>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h4" component="div" color={'text.primary'}>
                {title}: {files.length}
            </Typography>
            <List dense={true} sx={listStyle}>
                {files.map((file, index) => (
                    <React.Fragment key={index}>
                        <ListItem>
                            <Typography
                                color={'text.primary'}
                                variant='body1'
                            >
                                {file}
                            </Typography>
                        </ListItem>
                        <Divider component="li" variant='middle' />
                    </React.Fragment>
                ))}
            </List>
        </div>
    );

    return (
        <Box id="summary-container" bgcolor={'background.default'} sx={summaryStyle}>

            {!summary && <CircularProgress />}

            {summary && (
                <Grid container>
                    <Grid container xs={12} justifyContent={'center'} sx={{ mb: 2 }}>
                        <Typography variant="h3" component="div" color={'text.primary'}>
                            Summary
                        </Typography>
                    </Grid>
                    <Grid xs={6}>
                        {summary.approvedFiles.length > 0 && (
                            <FilesList title={'Approved'} files={summary.approvedFiles} />
                        )}
                    </Grid>
                    <Grid xs={6}>
                        {summary.rejectedFiles.length > 0 && (
                            <FilesList title={'Rejected'} files={summary.rejectedFiles} />
                        )}
                    </Grid>
                    <Grid xs={12}>
                        <Button
                            variant='contained'
                            color='primary'
                            size='large'
                            onClick={() => navigate('/')}
                        >
                            Back to Home
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default Summary;