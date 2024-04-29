import { useContext, useEffect, useState } from 'react';
import { useLoaderData, } from 'react-router-dom';
import { Image } from '../../types';
import { AppContext } from '../../contexts/app-context';
import PreviewComponent from '../../components/image-viewer/preview-component';
import PrevNextControls from './prev-next-controls';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { api } from '../../shared';
import { Alert, Button } from '@mui/material';
import x from '@stylexjs/stylex';
import { style } from '../../components/ui/helper-styles';

type PreviewData = {
    image: Image;
};

const PreviewPage = () => {
    const { setSuiteName } = useContext(AppContext);
    const { image } = useLoaderData() as PreviewData;
    const [ showApprovedMessage, setShowApprovedMessage ] = useState(false);

    useEffect(() => {
        setSuiteName(image.suiteName);
    }, [ image.suiteName, setSuiteName ]);

    const approveDiff = async () => {
		await fetch(api + '/assessment/approve-instantly', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
                suiteSlug: image.suiteName,
                fileName: image.fileName,
            }),
		});

        setShowApprovedMessage(true);
	};

    return (
        <PreviewComponent image={image}>

            {image.type === 'diff' && (    
                <div {...x.props(style.flex, style.justifyCenter, style.mt1)}>
                    {showApprovedMessage && (
                        <Alert severity='success'>
                            Diff approved successfully!
                        </Alert>
                    )}

                    {!showApprovedMessage && (
                        <Button
                            variant='contained'
                            color='success'
                            size='large'
                            startIcon={<ThumbUpIcon />}
                            onClick={() => approveDiff()}
                        >
                            Approve diff
                        </Button>
                    )}
                </div>
            )}

            <PrevNextControls />

        </PreviewComponent>
    );
};

export default PreviewPage;
