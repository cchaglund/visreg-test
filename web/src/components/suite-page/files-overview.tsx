import { List, ListItemText } from '@mui/material';
import { Link, useLoaderData } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../contexts/app-context';
import stylex from '@stylexjs/stylex';
import { SuiteContext } from './suite-page';

export type FilesOverviewData = {
    filesList: {
        baselineList: string[];
        diffList: string[];
        receivedList: string[];
    },
};

const s = stylex.create({
    filesOverview: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '3rem',
    },
    typeHeading: {
        textTransform: 'capitalize',
    },
    listOfFileLinks: {
        width: '100%',
    },
});

const FilesOverview = () => {
    const { filesList, } = useLoaderData() as FilesOverviewData;
    const { suiteName } = useContext(AppContext);
    const { selectedName, selectedViewport } = useContext(SuiteContext);

    const ListOfFileLinks = (list: string[], type: string) => (
        <div {...stylex.props(s.listOfFileLinks)}>
            <h3 {...stylex.props(s.typeHeading)}>
                <Link to={`/suite/${suiteName}/files/${type}`}>{type}</Link>
            </h3>
            <List>
                {list
                    .filter(file => file.includes(selectedName) && file.includes(selectedViewport))
                    .map((file, index) => (
                        <Link key={index} to={`/suite/${suiteName}/files/${type}/${file}`}>
                            <ListItemText primary={file} />
                        </Link>
                    ))}
            </List>
        </div>
    );

    return (
        <div {...stylex.props(s.filesOverview)}>
            {ListOfFileLinks(filesList.diffList, 'diff')}
            {ListOfFileLinks(filesList.baselineList, 'baseline')}
            {ListOfFileLinks(filesList.receivedList, 'received')}
        </div>
    );
};

export default FilesOverview;
