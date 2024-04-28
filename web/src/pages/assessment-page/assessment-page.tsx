import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/app-context';
import Controls from './controls';
import Progress from './progress';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { AssessmentData } from './types';
import { getImageDetails } from '../../loaders-and-fetchers';
import PreviewComponent from '../../components/image-viewer/preview-component';
import { Image } from '../../types';


const AssessmentPage = () => {
	const [ fetchedImagesDetails, setFetchedImagesDetails ] = useState<Image[]>([]);
	const { api, setSuiteName, setCurrentDiffIndex, currentDiffIndex } = useContext(AppContext);
	const { assessmentData } = useLoaderData() as { assessmentData: AssessmentData; };
	const navigate = useNavigate();

	useEffect(() => {
		if (!assessmentData) return;

		const diffFiles = assessmentData?.diffFiles;

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

		await fetch(api + '/assessment/' + action, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ diffImage: assessmentData.diffFiles[currentDiffIndex!] }),
		});

		if (currentDiffIndex === assessmentData.diffFiles.length - 1) {
			navigate('/summary');
			return;
		}

		if (currentDiffIndex !== null) {
			setCurrentDiffIndex(currentDiffIndex + 1);
		}
	};		

	return (
		<>
			{currentDiffIndex !== null && fetchedImagesDetails[currentDiffIndex] && (
				<PreviewComponent image={fetchedImagesDetails[currentDiffIndex]}>
					<Controls doAssessAction={(action: string) => doAssessAction(action)} />
					<Progress currentDiffIndex={currentDiffIndex} diffFiles={assessmentData.diffFiles} />
				</PreviewComponent>
			)}
		</>
	);
};

export default AssessmentPage;
