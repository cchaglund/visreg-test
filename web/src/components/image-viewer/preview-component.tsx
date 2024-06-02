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
		position: 'relative',
		'@media (max-width: 1100px)': {
			padding: '1rem',
		},
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

const xrayStyles = x.create({
	fabContainer: {
		position: 'absolute',
		top: '-1rem',
	},
	differenceContainer: {
		position: 'relative',
		overflow: 'auto',
		height: '70vh',
		backgroundColor: 'rgba(255,255,255,1)',
	},
	differenceComponentShared: {
		position: 'absolute',
		top: '0px',
		left: 0,
		width: '100%',
		filter: 'grayscale(1)'
	},
	differenceTop: {
		opacity: 1,
		mixBlendMode: 'exclusion',
	},
	differenceTopZindex: {
		zIndex: 2,
	},
	differenceBottom: {
		opacity: 0.5,
		zIndex: 1,
	},
	differenceTopPosition: (x, y) => ({
		left: x,
		top: y,
	}),
});

const PreviewComponent = (props: { image: Image; children?: React.ReactNode; isAssessment?: boolean; }) => {
	const [ zoomedIn, setZoomedIn ] = useState(false);
	const [ xray, setXray ] = useState(false);
	const [ topOffset, setTopOffset ] = useState(0);
	const [ leftOffset, setLeftOffset ] = useState(0);
	const [ hovering, setHovering ] = useState(false);
	const [ zindexFlip, setZindexFlip ] = useState(false);
	const { image } = props;
	const containerRef = useRef<HTMLDivElement>(null);

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Escape') {
			setZoomedIn(false);
			return;
		}

		if (!props.isAssessment) return;

		xrayControls(event);
	};

	const xrayControls = (event: React.KeyboardEvent) => {
		const increment = event.shiftKey ? 1 : 10;

		if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '.', ',', '0'].includes(event.key)) {
			event.preventDefault();
		}

		if (event.key === 'ArrowRight') {
			setLeftOffset(leftOffset - increment);
			return;
		}

		if (event.key === 'ArrowLeft') {
			setLeftOffset(leftOffset + increment);
			return;
		}

		if (event.key === 'ArrowUp') {
			setTopOffset(topOffset + increment);
			return;
		}

		if (event.key === 'ArrowDown') {
			setTopOffset(topOffset - increment);
			return;
		}

		if (event.key === '.') {
			setZindexFlip(!zindexFlip);
			return;
		}

		if (event.key === ',') {
			toggleXray();
			return;
		}

		if (event.key === '0') {
			setTopOffset(0);
			setLeftOffset(0);
			return;
		}
	};

	const toggleZoom = () => setZoomedIn(!zoomedIn);

	const toggleXray = () => setXray(!xray);

	return (
		<div {...x.props(s.wrapper)} onKeyDown={handleKeyPress} tabIndex={0} ref={containerRef}>

			<div {...x.props(xrayStyles.fabContainer)}>
				{props.isAssessment && (
					<Slide in={!zoomedIn} container={containerRef.current} direction='right'>
						<Fab color='secondary' size='large' variant='extended' onClick={toggleXray}>
							{xray ? 'Turn off' : ''} X-ray
						</Fab>
					</Slide>
				)}
				<Slide in={zoomedIn} container={containerRef.current} direction='right'>
					<Fab color='primary' size='large' variant='extended' onClick={toggleZoom}>
						<ZoomOutTwoTone fontSize='large' sx={{ mr: 1 }}/>
						Zoom out
					</Fab>
				</Slide>
			</div>

			<div {...x.props(s.container)}>
				{ !xray && (
					<div {...x.props(s.column, s.column1)}>
						<div
							{...x.props(style.flex, style.justifyCenter, style.cursorZoom)}
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
				)}
				
				{ xray && (
					<div>
						<div {...x.props(s.column, s.column1, xrayStyles.differenceContainer)}>
							<div {...x.props(
								style.flex,
								style.justifyCenter,
								style.cursorZoom,
								xrayStyles.differenceComponentShared,
								zindexFlip ? xrayStyles.differenceTop : xrayStyles.differenceBottom,
								xrayStyles.differenceTopPosition(leftOffset, topOffset),
							)}>
								<ImageComponent
									xray={true}
									hovering={hovering}
									zoomedIn={zoomedIn}
									image={{
										...image,
										fileUrl: image.fileUrl.replace('/diff/', '/received/').replace('.diff.png', '-received.png'),
									}}
								/>
							</div>
							<div {...x.props(
								style.flex,
								style.justifyCenter,
								style.cursorZoom,
								xrayStyles.differenceComponentShared,
								zindexFlip ? xrayStyles.differenceBottom : xrayStyles.differenceTop,

							)}>
								<ImageComponent
									xray={true}
									hovering={hovering}
									zoomedIn={zoomedIn}
									image={{
										...image,
										fileUrl: image.fileUrl.replace('/diff/', '/baseline/').replace('.diff.png', '.base.png'),
									}}
								/>
							</div>
						</div>

						<div {...x.props(style.flex, style.gap1, style.mt1, style.mb1)}>
							<Typography variant='body1' color='text.primary'>
								Black/white pixels are differences (gray = identical)
							</Typography>
						</div>
						<div {...x.props(style.flex, style.justifyCenter, style.gap1)}>
							<Typography variant='body2' color='text.primary'>
								Use <strong>Arrow keys</strong> to move the image
							</Typography>
							<Typography variant='body2' color='text.primary'>
								Hold <strong>Shift</strong> to move slower
							</Typography>
							<Typography variant='body2' color='text.primary'>
								Press <strong>0</strong> to reset the image position
							</Typography>
							<Typography variant='body2' color='text.primary'>
								Press <strong>.</strong> to invert diff color (black/white)
							</Typography>
							<Typography variant='body2' color='text.primary'>
								Press <strong>,</strong> to toggle X-ray mode
							</Typography>
						</div>
					</div>
				)}

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
