import { useContext, useEffect } from 'react';
import { useLoaderData, } from 'react-router-dom';
import { Image } from './types.d';
import { AppContext } from '../../contexts/app-context';
import PreviewComponent from './preview-component';
import PrevNextControls from './prev-next-controls';

type PreviewData = {
    image: Image;
};

const PreviewPage = () => {
    const { setSuiteName } = useContext(AppContext);
    const { image } = useLoaderData() as PreviewData;

    useEffect(() => {
        setSuiteName(image.suiteName);
    }, [ image.suiteName, setSuiteName ]);

    return (
        <PreviewComponent image={image}>
            <PrevNextControls />
        </PreviewComponent>
    );
};

export default PreviewPage;
