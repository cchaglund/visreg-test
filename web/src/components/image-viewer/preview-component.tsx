import { useRef, useState } from 'react';
import ImageComponent from './image';
import InformationTable from './information-table';
import x from '@stylexjs/stylex';
import PreviewHeader from './viewer-header';
import { Accordion, AccordionDetails, AccordionSummary, Fab, Slide, Typography } from '@mui/material';
import { ExpandMore, ZoomOutTwoTone } from '@mui/icons-material';
import EndpointsTable from '../endpoints-info-table/endpoints-table';
import { Image } from '../../types';
import { style } from '../ui/helper-styles';

const s = x.create({
	wrapper: {
		maxHeight: '-webkit-fill-available',
		width: '100%',
		padding: '2rem',
	},
	container: {
		height: '100%',
		maxWidth: '100vw',
		margin: '0 auto',
		// alignItems: 'center',
		justifyContent: 'space-between',
		display: 'flex',
		columnGap: '3rem',
		'@media (max-width: 1100px)': {
			flexWrap: 'wrap',
			justifyContent: 'center',
			alignItems: 'space-between',
			rowGap: '3rem',
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
		'@media (min-width: 1101px)': {
			marginTop: '17%',
			marginBottom: 'auto',
		}
	},
	accordion: {
		'::before': {
			display: 'none'
		},
		borderTop: '1px solid rgba(0,0,0,0.1)',
	},
});

const PreviewComponent = (props: { image: Image; children?: React.ReactNode; }) => {
	const [ zoomedIn, setZoomedIn ] = useState(false);
	const [ hovering, setHovering ] = useState(false);
	const { image } = props;
	const containerRef = useRef<HTMLDivElement>(null);

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Escape') {
			setZoomedIn(false);
		}
	};

	const toggleZoom = () => setZoomedIn(!zoomedIn);

	return (
		<div {...x.props(s.wrapper)} onKeyDown={handleKeyPress} tabIndex={0} ref={containerRef}>

			<div {...x.props(style.posAbs)}>
				<Slide in={zoomedIn} container={containerRef.current} direction='right'>
					<Fab color='primary' size='large' variant='extended' onClick={toggleZoom}>
						<ZoomOutTwoTone fontSize='large' sx={{ mr: 1 }}/>
						Zoom out
					</Fab>
				</Slide>
			</div>

			<div {...x.props(s.container)}>
				<div {...x.props(s.column, s.column1)}>
					<div 
						{...x.props(style.flex, style.justifyCenter, style.cursorZoom )}
						onMouseEnter={() => setHovering(true)}
						onMouseLeave={() => setHovering(false)}
						onClick={() => toggleZoom()}
					>
						<ImageComponent
							hovering={hovering}
							zoomedIn={zoomedIn}
							image={image}
						/>
					</div>
				</div>

				<div {...x.props(s.column, s.column2)}>
					<PreviewHeader image={image} />
					<InformationTable image={image} />

					{ image.endpoint && (
						<Accordion sx={{ borderRadius: '12px' }} {...x.props(s.accordion)} color='primary'>
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
