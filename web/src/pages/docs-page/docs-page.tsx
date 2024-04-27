import { useLoaderData } from 'react-router-dom';
import x from '@stylexjs/stylex';
import { style } from '../../components/ui/helper-styles';
import { Button, Link, Typography, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import KeyboardDoubleArrowUpTwoToneIcon from '@mui/icons-material/KeyboardDoubleArrowUpTwoTone';

type DocsPageData = {
    docs: string;
};

const s = x.create({
    documentationContainer: {
        fontFamily: 'Ubunto Mono, monospace',
        width: '100%',
        padding: '3rem',
        paddingLeft: '0',
    },
    readme: {
        width: '100%',
    },
    toc: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'space-between',
        fontSize: '0.9rem',
        height: 'max-content',
        minWidth: '300px',
        position: 'sticky',
        top: '2rem',
    }
});

const DocsPage = () => {
    const { docs } = useLoaderData() as DocsPageData;
    const [ body, setBody ] = useState<string>('');
    const [ toc, setToc ] = useState<string>('');
    const theme = useTheme();


    useEffect(() => {
        const toc = extractToc(docs);
        const sansToc = docs.replace(toc, '').replace('<h1>Table of contents</h1>', '');
        const hydrated = hydrateHeadingsWithIds(sansToc);
        setBody(hydrated);
        setToc(toc);
    }, [ docs ]);

    const hydrateHeadingsWithIds = (html: string) => {
        // Add ids to headings to enable linking to them
        const hydrated = html.replace(/<h([1-6])>([^<]+)<\/h[1-6]>/g, (match, p1, p2) => {
            return `<h${p1} id="${p2.toLowerCase().replace(/\s/g, '-')}">${p2}</h${p1}>`;
        });

        return hydrated;
    };

    const extractToc = (html: string) => {
        const tocStarter = "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->";
        const tocStart = html.indexOf(tocStarter) + tocStarter.length;
        const tocEnd = html.indexOf("<!-- END doctoc generated TOC please keep comment here to allow auto update -->");
        const toc = html.slice(tocStart, tocEnd);

        // // replace the links (href="#blabla") with an onclick event that scrolls to the element
        // const tocWithScroll = toc.replace(/href="#([^"]+)"/g, (match, p1) => {
        //     return `onclick="document.getElementById('${p1}').scrollIntoView({ behavior: 'smooth' })"`;
        // });

        // return tocWithScroll;

        return toc;
    };

    return (
        <div {...x.props(s.documentationContainer)}>
            <div {...x.props(style.flex, style.gap2)}>
                <div {...x.props(s.toc)}>
                    <div dangerouslySetInnerHTML={{ __html: toc }} />
                    <Button
                        variant='contained'
                        color='secondary'
                        sx={{ alignSelf: 'center', marginTop: '100%' }}
                        startIcon={<KeyboardDoubleArrowUpTwoToneIcon />}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        Top
                    </Button>
                </div>

                <div {...x.props(
                    s.readme,
                    theme.palette.mode === 'dark' ? style.lightText : style.darkText,
                )}>
                    <Link href="https://www.npmjs.com/package/visreg-test" target="_blank" rel="noreferrer">
                        <Typography
                            variant='h4'
                            color={'text.primary'}
                            mb={2}
                        >
                            NPM package
                        </Typography>
                    </Link>

                    <Link href="https://github.com/cchaglund/visreg-test" target="_blank" rel="noreferrer">
                        <Typography
                            variant='h4'
                            color={'text.primary'}
                            mb={2}
                        >
                            Github
                        </Typography>
                    </Link>

                    <div dangerouslySetInnerHTML={{ __html: body }} />
                </div>
            </div>
        </div>
    );
};

export default DocsPage;

