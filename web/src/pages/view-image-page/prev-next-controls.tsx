import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, } from 'react-router-dom';
import { ImagesList, ImagesListType } from '../suite-page/suite-page';
import x from '@stylexjs/stylex';
import { Image } from '../../types';
import { PrevNextButton } from '../../components/ui/prev-next-button';

const s = x.create({
    controlsContainer: {
        width: 'auto',
        display: 'flex',
        textOverflow: 'ellipsis',
        justifyContent: 'space-between',
        gap: '2.5rem',
        maxWidth: '650px',
        margin: '0 auto',
        marginBlock: '1rem',
    },
    prevNextBlock: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'center',
    },
    nextBlock: {
        flexDirection: 'row-reverse',
    },
    link: {
        flexBasis: '50%',
        flexGrow: 0,
        flexShrink: 1,
        width: '1px',
    },
    text: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    }
});


const PrevNextControls = () => {
    const { image, imagesList } = useLoaderData() as { image: Image; imagesList: ImagesList; };

    const [ priorFilename, setPreviousImageName ] = useState<string | null>(null);
    const [ followingFilename, setNextImageName ] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!image || !imagesList) return;

        const listName = image.type + 'List' as ImagesListType;
        const list = imagesList[ listName ];

        const indexOfCurrentFile = list.indexOf(image.fileName);
        const nextFileIndex = indexOfCurrentFile + 1 === list.length ? 0 : indexOfCurrentFile + 1;
        const prevFileIndex = indexOfCurrentFile - 1 < 0 ? list.length - 1 : indexOfCurrentFile - 1;

        setNextImageName(list[ nextFileIndex ]);
        setPreviousImageName(list[ prevFileIndex ]);
    }, [ image, imagesList ]);

    const ControlsContainer = (props: { children: React.ReactNode; }) => (
        <div {...x.props(s.controlsContainer)}>
            {props.children}
        </div>
    );

    return (
        <ControlsContainer>
            {priorFilename && !priorFilename.includes(image.name) && (
                <PrevNextButton
                    direction="prev"
                    title={priorFilename}
                    clickHandler={() => {
                        navigate(`/suite/${image.suiteName}/images/${image.type}/${priorFilename}`);
                    }}
                />
            )}

            {followingFilename && !followingFilename.includes(image.name) && (
                <PrevNextButton
                    direction="next"
                    title={followingFilename}
                    clickHandler={() => {
                        navigate(`/suite/${image.suiteName}/images/${image.type}/${followingFilename}`);
                    }}
                />
            )}
        </ControlsContainer>
    );
};

export default PrevNextControls;
