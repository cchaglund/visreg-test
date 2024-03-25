import { useState } from 'react';
import ImagePreview from './image-preview';
import InformationTable from './information-table';
import stylex from '@stylexjs/stylex';
import PreviewHeader from './preview-header';
import { File } from './types.d';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import EndpointsList from '../suite-page/endpoint-list';

const s = stylex.create({
	wrapper: {
		maxHeight: '-webkit-fill-available',
	},
	container: {
		height: '100%',
		width: 'auto',
		maxWidth: '100vw',
		margin: '0 auto',
		padding: '2rem',
		alignItems: 'center',
		justifyContent: 'space-between',
		display: 'flex',
		columnGap: '2rem',
		'@media (max-width: 1000px)': {
			flexWrap: 'wrap',
			justifyContent: 'center',
			alignItems: 'space-between',
		}
	},
	column: {
		width: 'auto'
	},
	column1: {
		paddingInline: '2rem',
		margin: '0 auto',
		minWidth: '375px',
	},
	column2: {
		maxWidth: '800px',
		width: 'auto',
        minWidth: '375px',
	},
	accordion: {
		'::before': {
			display: 'none'
		},
		borderTop: '1px solid rgba(0,0,0,0.1)',
	}
});

const PreviewComponent = (props: { file: File; children?: React.ReactNode; }) => {
	const [ zoomedIn, setZoomedIn ] = useState(false);
	const { file } = props;

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
					<div>
						<ImagePreview
							toggleZoom={() => toggleZoom()}
							zoomedIn={zoomedIn}
							file={file}
						/>
					</div>
				</div>

				<div {...stylex.props(s.column, s.column2)}>
                    <PreviewHeader file={file} />
					<InformationTable file={file} />
					<Accordion sx={{borderRadius: '12px'}} {...stylex.props(s.accordion)}>
						<AccordionSummary
							expandIcon={<ExpandMore />}
							aria-controls="panel1-content"
							id="panel1-header"
						>
							Endpoint configuration
						</AccordionSummary>
						<AccordionDetails>
							<EndpointsList endpoints={[file.endpoint]} />
						</AccordionDetails>
					</Accordion>
                    { props?.children }
				</div>
			</div>
		</div>
	);
};

export default PreviewComponent;
