import Button from '@mui/material/Button';
import { Typography, List, ListItem, Divider, Box, Dialog, DialogContent } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React, { useContext, useEffect } from 'react';
import { api } from '../../shared'
import {
    useLoaderData,
    useNavigate,
} from 'react-router-dom';
import { AppContext } from '../../contexts/app-context';

export type SummaryType = {
    suiteSlug: string;
    approvedFiles: string[];
    rejectedFiles: string[];
    failed: boolean;
};

const listStyle = {
    py: 0,
    width: '100%',
    maxWidth: 360,
};

const summaryStyle = {
    height: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem',
    bgcolor: 'background.default',
};

type SummaryData = {
    summary: SummaryType;
};

const AssessmentSummary = () => {
    const { setCurrentDiffIndex } = useContext(AppContext);
    const { summary } = useLoaderData() as SummaryData;
    const [ appQuit, setAppQuit ] = React.useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentDiffIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const quitApp = async () => {
        try {
            fetch(`${api}/terminate-process`, { method: 'POST' })
        } catch (error) {
            //
        }

        setAppQuit(true);
    };

    const ImagesList = ({ files, title }: { files: string[]; title: string; }) => (
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

            <Dialog open={appQuit}>
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
                        <Typography variant="h6">
                            App quit. You can now close this window
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>

            {summary && (
                <Grid container>
                    <Grid container xs={12} justifyContent={'center'} sx={{ mb: 2 }}>
                        <Typography variant="h3" component="div" color={'text.primary'}>
                            Summary
                        </Typography>
                    </Grid>
                    <Grid xs={6}>
                        <ImagesList title={'Approved'} files={summary.approvedFiles} />
                    </Grid>
                    <Grid xs={6}>
                        <ImagesList title={'Rejected'} files={summary.rejectedFiles} />
                    </Grid>
                    <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 10, gap: '1rem' }}>
                        <Button
                            variant='contained'
                            color='primary'
                            size='large'
                            onClick={() => navigate('/suite/' + summary.suiteSlug)}
                        >
                            Back to suite
                        </Button>

                        <Button
                            variant='contained'
                            color='secondary'
                            size='large'
                            onClick={() => quitApp()}
                        >
                            Quit Visreg
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default AssessmentSummary;