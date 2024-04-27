import { Card, CardActionArea, CardContent } from '@mui/material';
import x from '@stylexjs/stylex';

const s = x.create({
    actions: {
        padding: '2rem',
        display: 'flex',
        gap: '3rem',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    card: {
        width: 170,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'column',
    },
    comingSoon: {
        flexDirection: 'column',
        color: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        cursor: 'default',
    },
});

type ActionCardProps = {
    onClick: () => void;
    children: React.ReactNode;
};

export const ActionCard = (props: ActionCardProps) => {
    return (
        <Card elevation={7} sx={{ borderRadius: '1rem' }}>
            <CardActionArea onClick={() => props.onClick()}>
                <CardContent {...x.props(s.card)}>
                    {props.children}
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
