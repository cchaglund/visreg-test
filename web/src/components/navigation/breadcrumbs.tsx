import { Link, useMatches } from 'react-router-dom';
import { Breadcrumbs, Typography } from '@mui/material';
import { NavigateNext as NavigateNextIcon} from '@mui/icons-material';
import stylex from '@stylexjs/stylex';

export type MatchType = {
    handle: {
        crumb: (arg: object) => {
            path: string;
            slug: string;
        };
    },
    data: object;
    pathname: string;
    params: object;
}

const s = stylex.create({
    breadcrumbs: {
        textTransform: 'capitalize',
    },
    link: {
        ':hover': {
            textDecoration: 'underline',
            color: 'inherit'
        }
    },
});

const BreadcrumbsComponent = () => {
    const matches = useMatches() as MatchType[];
    
    const crumbs = matches
        .filter((match: MatchType) => Boolean(match?.handle?.crumb))
        .map((match: MatchType) => match.handle?.crumb(match.data))
        .flat();
    
    return (
        <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            {...stylex.props(s.breadcrumbs)}
        >
            {crumbs.map((crumb, index) => {
                if (index !== crumbs.length - 1) {
                    return (
                        <Link to={crumb.path} key={index} {...stylex.props(s.link)}>
                            <Typography variant='h6' color='text.secondary'>
                                {crumb.slug}
                            </Typography>
                        </Link>
                    )
                }
                
                return (
                    <Typography variant='h6' color='text.primary' key={index}>
                        {crumb.slug}
                    </Typography>
                )
            })}
        </Breadcrumbs>
    );
}

export default BreadcrumbsComponent;
