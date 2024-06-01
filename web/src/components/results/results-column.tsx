import { Typography } from '@mui/material';
import x from '@stylexjs/stylex';

const s = x.create({
    testNameContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        maxWidth: '300px',
    },
    columnsContainer: {
        display: 'flex',
        gap: '4rem',
        justifyContent: 'center',
    },
    column: {
        width: 'auto',
    },
});

export const ResultsColumn = ({ children, heading, subheading }: { children?: React.ReactNode; heading: string; subheading?: string; }) => {
    return (
        <div {...x.props(s.columnsContainer)}>
            <div {...x.props(s.column)}>
                <div {...x.props(s.testNameContainer)}>
                    <Typography
                        variant='h5'
                        color={'text.primary'}
                    >
                        {heading}
                    </Typography>
                    <Typography
                        variant='subtitle1'
                        color={'text.disabled'}
                    >
                        {subheading}
                    </Typography>
                </div>

                {children}
            </div>
        </div>
    );
};
