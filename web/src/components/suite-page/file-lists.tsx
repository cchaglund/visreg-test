import { List, ListItemText, Typography } from '@mui/material';
import { Link, useLoaderData } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../contexts/app-context';
import { SuiteContext } from './suite-page';
import stylex from '@stylexjs/stylex';

export type FileListsData = {
    fileNames: string[];
    typeOfFiles: string;
}

const s = stylex.create({
    fileList: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
    },
    heading: {
        textTransform: 'capitalize',
    },
});

const FileLists = () => {    
    const { fileNames, typeOfFiles } = useLoaderData() as FileListsData;
    const { suiteName } = useContext(AppContext);
    const { selectedName, selectedViewport } = useContext(SuiteContext);
    
    return (
        <div {...stylex.props(s.fileList)}>
            <Typography variant='h5' {...stylex.props(s.heading)} >
                {typeOfFiles}
            </Typography>

            {fileNames && typeOfFiles && (
                <List>
                    {fileNames
                        .filter(file => file.includes(selectedName) && file.includes(selectedViewport))
                        .map((file, index) => (
                            <Link key={index} to={`/suite/${suiteName}/files/${typeOfFiles}/${file}`}>
                                <ListItemText primary={file} />
                            </Link>
                        ))}
                </List>
            )}
        </div>
    );
};

export default FileLists;
