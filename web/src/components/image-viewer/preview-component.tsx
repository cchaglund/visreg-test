import { useState } from 'react';
import ImageComponent from './image';
import InformationTable from './information-table';
import stylex from '@stylexjs/stylex';
import PreviewHeader from './viewer-header';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import EndpointsTable from '../endpoints-info-table/endpoints-table';
import { Image } from '../../types';
import { style } from '../ui/helper-styles';

const s = stylex.create({
	wrapper: {
		maxHeight: '-webkit-fill-available',
		width: '100%',
		padding: '2rem',
	},
	container: {
		height: '100%',
		maxWidth: '100vw',
		margin: '0 auto',
		alignItems: 'center',
		justifyContent: 'space-between',
		display: 'flex',
		columnGap: '4rem',
		'@media (max-width: 1100px)': {
			flexWrap: 'wrap',
			justifyContent: 'center',
			alignItems: 'space-between',
			rowGap: '1rem',
		}
	},
	column: {
		width: 'auto'
	},
	column1: {
		margin: '0 auto',
		minWidth: '375px',
		flexGrow: 1,
	},
	column2: {
		width: '570px',
		minWidth: '570px',
		flexShrink: 5,
	},
	accordion: {
		'::before': {
			display: 'none'
		},
		borderTop: '1px solid rgba(0,0,0,0.1)',
	}
});

const PreviewComponent = (props: { image: Image; children?: React.ReactNode; }) => {
	const [ zoomedIn, setZoomedIn ] = useState(false);
	const { image } = props;

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Escape') {
			setZoomedIn(false);
		}
	};

	const toggleZoom = () => setZoomedIn(!zoomedIn);

	return (
		<div {...stylex.props(s.wrapper)} onKeyDown={handleKeyPress} tabIndex={0}>

			<div {...stylex.props(s.container)}>
				<div {...stylex.props(s.column, s.column1)}>
					<div {...stylex.props(style.flex, style.justifyCenter)}>
						<ImageComponent
							toggleZoom={() => toggleZoom()}
							zoomedIn={zoomedIn}
							image={image}
						/>
					</div>
				</div>

				<div {...stylex.props(s.column, s.column2)}>
					<PreviewHeader image={image} />
					<InformationTable image={image} />

					{ image.endpoint && (
						<Accordion sx={{ borderRadius: '12px' }} {...stylex.props(s.accordion)} color='primary'>
							<AccordionSummary
								expandIcon={<ExpandMore />}
								aria-controls="panel1-content"
								id="panel1-header"
							>
								<Typography variant='body1'>
									Endpoint configuration
								</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<EndpointsTable endpoints={[ image.endpoint ]} />
							</AccordionDetails>
						</Accordion>
					)}
					{props?.children}
				</div>
			</div>
		</div>
	);
};

export default PreviewComponent;
