import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const RawFilePanel = ({ url, path }: { url?: string; path?: string}) => {

    return (
        <div>
            {url && (
                <a
                    href={`${url}`}
                    target='_blank'
                    rel='noreferrer'
                >
                    <Button variant='outlined' color="primary" size='small' sx={{ marginRight: '0.5rem' }}>
                        <OpenInNewIcon sx={{ mr: 1 }} />
                        Open file
                    </Button>
                </a>
            )}

            {path && (
                <Button
                    variant='outlined' color="primary"
                    size='small'
                    onClick={() => {
                        if (path) {
                            navigator.clipboard.writeText(path);
                        }
                    }}
                >
                    <ContentCopyIcon sx={{ mr: 1 }} />
                    Copy disk path
                </Button>
            )}
        </div>
    );
};

export default RawFilePanel;