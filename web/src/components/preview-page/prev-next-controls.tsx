import { useContext, useEffect, useState } from 'react';
import { useLoaderData, useNavigate, } from 'react-router-dom';
import { FilesListsType, SuiteContext } from '../suite-page/suite-page';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import stylex from '@stylexjs/stylex';
import { Link, Typography } from '@mui/material';
import { File } from './types.d';

const s = stylex.create({
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
    const { file } = useLoaderData() as { file: File}
    const { filesList } = useContext(SuiteContext);
    const [ previousImageName, setPreviousImageName ] = useState<string | null>(null);
    const [ nextImageName, setNextImageName ] = useState<string | null>(null);    
    const navigate = useNavigate();

    useEffect(() => {
        if (!file || !filesList) return;

        const listName = file.type + 'List' as FilesListsType;
        const list = filesList[listName];

        const indexOfCurrentFile = list.indexOf(file.fileName);
        const nextFileIndex = indexOfCurrentFile + 1 === list.length ? 0 : indexOfCurrentFile + 1;
        const prevFileIndex = indexOfCurrentFile - 1 < 0 ? list.length - 1 : indexOfCurrentFile - 1;

        setNextImageName(list[nextFileIndex]);
        setPreviousImageName(list[prevFileIndex]);        
    }, [file, filesList]);

    const ControlsContainer = (props: { children: React.ReactNode; }) => (
        <div {...stylex.props(s.controlsContainer)}>
            {props.children}
        </div>
    )

    const PrevNextBlock = (props: { direction: string; }) => {
        const name = props.direction === 'prev' ? previousImageName : nextImageName;
        const icon = props.direction === 'prev' ? <ArrowBackIcon /> : <ArrowForwardIcon />;

        if (name && name.includes(file.name)) return null; // if there's no next or previous file, don't render the block

        return (
            <Link
                {...stylex.props(s.link)}
                component="button"
                onClick={() => {
                    navigate(`/suite/${file.suiteName}/files/${file.type}/${name}`)
                }}
            >
                <div {...stylex.props(s.prevNextBlock, props.direction === 'next' && s.nextBlock)}>
                    {icon}
                    <Typography {...stylex.props(s.text)} variant="body1">
                        {name}
                    </Typography>
                </div>
            </Link>
        )
    }


    return (
        <ControlsContainer>
            <PrevNextBlock direction="prev" />
            <PrevNextBlock direction="next" />
        </ControlsContainer>
    );
};

export default PrevNextControls;
