import { useContext, useEffect, useState } from 'react';
import { useLoaderData, useNavigate, } from 'react-router-dom';
import { ImagesListType, SuiteContext } from '../suite-page/suite-page';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import x from '@stylexjs/stylex';
import { Link, Typography } from '@mui/material';
import { Image } from './types.d';

const s = x.create({
    controlsContainer: {
        width: 'auto',
        display: 'flex',
        textOverflow: 'ellipsis',
        justifyContent: 'space-between',
        gap: '1rem',
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
    const { image } = useLoaderData() as { image: Image; };
    const { imagesList } = useContext(SuiteContext);
    const [ previousImageName, setPreviousImageName ] = useState<string | null>(null);
    const [ nextImageName, setNextImageName ] = useState<string | null>(null);
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

    const PrevNextBlock = (props: { direction: string; }) => {
        const name = props.direction === 'prev' ? previousImageName : nextImageName;
        const icon = props.direction === 'prev' ? <ArrowBackIcon /> : <ArrowForwardIcon />;

        if (name && name.includes(image.name)) return null;

        return (
            <Link
                {...x.props(s.link)}
                component="button"
                onClick={() => {
                    navigate(`/suite/${image.suiteName}/images/${image.type}/${name}`);
                }}
            >
                <div {...x.props(s.prevNextBlock, props.direction === 'next' && s.nextBlock)}>
                    {icon}
                    <Typography
                        {...x.props(s.text)}
                        variant="body1"
                    >
                        {name}
                    </Typography>
                </div>
            </Link>
        );
    };

    return (
        <ControlsContainer>
            <PrevNextBlock direction="prev" />
            <PrevNextBlock direction="next" />
        </ControlsContainer>
    );
};

export default PrevNextControls;
