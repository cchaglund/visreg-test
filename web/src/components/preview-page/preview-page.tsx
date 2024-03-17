import { useContext, useEffect } from 'react';
import { useLoaderData, } from 'react-router-dom';
import { File } from './types.d';
import { AppContext } from '../../contexts/app-context';
import PreviewComponent from './preview-component';
import PrevNextControls from './prev-next-controls';

type PreviewData = {
    file: File;
}

const PreviewPage = () => {
    const { setSuiteName } = useContext(AppContext);
	const { file } = useLoaderData() as PreviewData

    useEffect(() => {
        setSuiteName(file.suiteName);
    }, [file.suiteName, setSuiteName]);

	return (
        <PreviewComponent file={file}>
            <PrevNextControls/>
        </PreviewComponent>
	);
};

export default PreviewPage;
