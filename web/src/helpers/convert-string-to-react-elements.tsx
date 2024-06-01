import x from '@stylexjs/stylex';
import React from 'react';
import { terminalStyles } from '../styles/terminal-style';

export const convertStringToElements = (stringifiedElements: (string | React.ReactElement)[]) => {

    const elements: React.ReactElement[] = stringifiedElements.map((item, i) => {
        if (typeof item === 'string') {
            return <pre {...x.props(terminalStyles.log)} key={i}>{item}</pre>
        }

        if (item && item.type && item.props) {
            if (Array.isArray(item.props.children)) {
                return React.createElement(
                    item.type,
                    { ...item.props, key: i, children: convertStringToElements(item.props.children) }
                );
            }

            return React.createElement(
                item.type,
                { ...item.props, key: i }
            );
        }

        return <span key={i}>Unknown element</span>
    })

    return elements;
};
