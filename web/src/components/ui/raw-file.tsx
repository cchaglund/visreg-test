import FileOpenTwoToneIcon from '@mui/icons-material/FileOpenTwoTone';
import { Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const RawFilePanel = ({ url, path }: { url?: string; path?: string; }) => {

    return (
        <div>
            {url && (
                <a
                    href={`${url}`}
                    target='_blank'
                    rel='noreferrer'
                >
                    <Button
                        variant='text'
                        color='primary'
                        startIcon={<FileOpenTwoToneIcon />}
                        sx={{ mr: 1 }}
                    >
                        Open file
                    </Button>
                </a>
            )}

            {path && (
                <Button
                    variant='outlined'
                    color="secondary"
                    size='small'
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                        if (path) {
                            navigator.clipboard.writeText(path);
                        }
                    }}
                >
                    Copy disk path
                </Button>
            )}
        </div>
    );
};

export default RawFilePanel;