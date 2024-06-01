import x from '@stylexjs/stylex';
import React, { useEffect } from 'react';
import { terminalStyles } from '../../../../styles/terminal-style';
import { convertStringToElements } from '../../../../helpers/convert-string-to-react-elements';

const HistoryTerminal = (props: { terminalOutput: (string | React.ReactElement)[] }) => {
    const [ parsedElements, setParsedElements ] = React.useState<React.ReactElement[]>([]);

    useEffect(() => {
        setParsedElements(convertStringToElements(props.terminalOutput));
    }, [props.terminalOutput]);

    return (
        <div {...x.props(terminalStyles.terminal)}>
            { parsedElements }
        </div>
    );
};

export default HistoryTerminal;
