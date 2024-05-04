import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/app-context';
import Controls from './controls';
import Progress from './progress';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { AssessmentData, DiffObject } from './types';
import { getImageDetails } from '../../loaders-and-fetchers';
import PreviewComponent from '../../components/image-viewer/preview-component';
import { Image } from '../../types';
import { PrevNextButton } from '../../components/ui/prev-next-button';
import x from '@stylexjs/stylex';
import { useTheme } from '@mui/material';

type TemporaryAssessmentResultsLookupTable = {
	[index: number]: DiffObject;
};

const s = x.create({
	approvedLightmode: {
		backgroundColor: 'rgb(243, 247, 243)',
		border: '1px solid rgba(143, 175, 144, 0.8)',
		borderRadius: '0.75rem',
	},
	approvedDarkmode: {
		backgroundColor: 'rgba(243, 255, 243, 0.08)',
		border: '1px solid rgba(143, 175, 144, 0.6)',
		borderRadius: '0.75rem',
	},
	rejectedLightmode: {
		backgroundColor: 'rgba(250, 236, 237, 1)',
		border: '1px solid rgba(211, 74, 80, 0.8)',
		borderRadius: '0.5rem',
	},
	rejectedDarkmode: {
		backgroundColor: 'rgba(255, 94, 109, 0.08)',
		border: '1px solid rgba(211, 74, 80, 0.6)',
		borderRadius: '0.5rem',
	},
	assessmentPage: {
		width: '100%',
	},
	controlsContainer: {
	},
	prevNextContainer: {
        width: 'auto',
        display: 'flex',
        textOverflow: 'ellipsis',
        justifyContent: 'space-between',
        gap: '1rem',
        maxWidth: '650px',
        margin: '0 auto',
        marginBlock: '1rem',
    },
});


const AssessmentPage = () => {
	const [ fetchedImagesDetails, setFetchedImagesDetails ] = useState<Image[]>([]);
	const [ temporaryAssessmentData, setTemporaryAssessmentData ] = useState<TemporaryAssessmentResultsLookupTable>([]);
	const { api, setSuiteName, setCurrentDiffIndex, currentDiffIndex } = useContext(AppContext);
	const { assessmentData } = useLoaderData() as { assessmentData: AssessmentData; };
	const navigate = useNavigate();
	const theme = useTheme();

	useEffect(() => {
		if (!assessmentData) return;

		const diffFiles = assessmentData?.diffFiles;
		setTemporaryAssessmentData(assessmentData.temporaryAssessmentResults);

		if (!diffFiles) {
			setCurrentDiffIndex(null);
			return;
		}

		if (currentDiffIndex === null) {
			setCurrentDiffIndex(0);
		}

		const getImages = async () => {
			const allImages = diffFiles.map((diff) => {
				return getImageDetails({
					suiteSlug: assessmentData.suiteSlug,
					fileName: diff.imageName + '.diff.png',
				});
			});

			const images = await Promise.all(allImages)
			setFetchedImagesDetails(images);
		};

		getImages();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setSuiteName(assessmentData?.suiteSlug);
	}, [ assessmentData?.suiteSlug, setSuiteName ]);

	// TODO: Implement keyboard shortcuts
	// const handleKeyPress = (event: React.KeyboardEvent) => {
	// 	if (event.key === ' ') {
	// 		doAssessAction('reject');
	// 	} else if (event.key === 'Enter') {
	// 		doAssessAction('approve');
	// 	} else if (event.key === 'Escape') {
	// 		setZoomedIn(false);
	// 	}
	// };

	const doAssessAction = async (action: string) => {
		if (!assessmentData) return;

		const res = await fetch(api + '/assessment/' + action, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ diffImage: assessmentData.diffFiles[currentDiffIndex!] }),
		});

		const tempAssessmentResults: TemporaryAssessmentResultsLookupTable = await res.json();
		setTemporaryAssessmentData(tempAssessmentResults);

		if (currentDiffIndex === assessmentData.diffFiles.length - 1) {
			navigate('/summary');
			return;
		}

		if (currentDiffIndex !== null) {
			setCurrentDiffIndex(currentDiffIndex + 1);
		}
	};

	const prevNextClickHandler = (direction: string) => {
		if (currentDiffIndex === null) return;
		const newIndex = direction === 'next' ? currentDiffIndex + 1 : currentDiffIndex - 1;
		setCurrentDiffIndex(newIndex)
	};

	return (
		<>
			{currentDiffIndex !== null && (
				<div {...x.props(
					s.assessmentPage,
					theme.palette.mode === 'dark'
						? temporaryAssessmentData[ currentDiffIndex ]?.assessedAs === 'rejected' && s.rejectedDarkmode
						: temporaryAssessmentData[ currentDiffIndex ]?.assessedAs === 'rejected' && s.rejectedLightmode,
					theme.palette.mode === 'dark'
						? temporaryAssessmentData[ currentDiffIndex ]?.assessedAs === 'approved' && s.approvedDarkmode
						: temporaryAssessmentData[ currentDiffIndex ]?.assessedAs === 'approved' && s.approvedLightmode,
				)}>
			
					{fetchedImagesDetails[ currentDiffIndex ] && (
						<PreviewComponent image={fetchedImagesDetails[ currentDiffIndex ]}>
							<div {...x.props(s.controlsContainer)}>

								<div {...x.props(s.prevNextContainer)}>
									{currentDiffIndex - 1 >= 0 ? (
										<PrevNextButton
											title={currentDiffIndex ? assessmentData.diffFiles[ currentDiffIndex - 1 ].imageName : ''}
											direction='prev'
											clickHandler={() => prevNextClickHandler('prev')}
										/>
									) : <div />}

									{(currentDiffIndex + 1 < assessmentData.diffFiles.length) &&
										temporaryAssessmentData[ currentDiffIndex]?.assessedAs ? (
										<PrevNextButton
											title={assessmentData.diffFiles[ currentDiffIndex + 1 ].imageName}
											direction='next'
											clickHandler={() => prevNextClickHandler('next')}
										/>
									) : <div />}
								</div>

								<Controls doAssessAction={(action: string) => doAssessAction(action)} />

							</div>
							<Progress currentDiffIndex={currentDiffIndex} diffFiles={assessmentData.diffFiles} />
						</PreviewComponent>
					)}
				</div>

			)}
		</>
	);
};

export default AssessmentPage;
