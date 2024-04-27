import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/app-context';
import Controls from './controls';
import Progress from './progress';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { AssessmentData, DiffObject } from './types';
import { getImageDetails } from '../../loaders-and-fetchers';
import PreviewComponent from '../../components/image-viewer/preview-component';


const AssessmentPage = () => {
	const [ imageDetails, setImageDetails ] = useState(null);
	const [ currentDiff, setCurrentDiff ] = useState<DiffObject>();
	const { api, setSuiteName, setCurrentDiffIndex, currentDiffIndex } = useContext(AppContext);
	const { assessmentData } = useLoaderData() as { assessmentData: AssessmentData; };
	const navigate = useNavigate();

	useEffect(() => {
		// TODO: This is way too reactive
		if (!assessmentData) return;

		const diffFiles = assessmentData?.diffFiles;

		if (!diffFiles) {
			setCurrentDiffIndex(null);
			return;
		}

		const newCurrentDiffIndex = currentDiffIndex === null ? 0 : currentDiffIndex;
		if (currentDiffIndex === null) {
			setCurrentDiffIndex(newCurrentDiffIndex);
		}

		const diff = assessmentData.diffFiles[ newCurrentDiffIndex ];

		if (!diff) {
			setCurrentDiffIndex(null);
			return;
		}

		const getFile = async () => {
			const image = await getImageDetails({
				suiteSlug: assessmentData.suiteSlug,
				fileName: diff?.imageName + '.diff.png',
			});

			if (!image?.error) {
				setImageDetails(image);
				setCurrentDiff(diff);
			}
		};

		getFile();
	}, [ assessmentData, currentDiff?.imageName, currentDiffIndex, setCurrentDiffIndex ]);

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
			body: JSON.stringify({ diffImage: currentDiff }),
		});

		if (currentDiffIndex === assessmentData.diffFiles.length - 1) {
			setCurrentDiffIndex(null);
			navigate('/summary');
			return;
		}

		if (currentDiffIndex !== null) {
			setCurrentDiffIndex(currentDiffIndex + 1);
		}
	};

	if (!currentDiff) return null;

	return (
		<>
			{imageDetails && (
				<PreviewComponent image={imageDetails}>
					<Controls doAssessAction={(action: string) => doAssessAction(action)} />
					<Progress currentDiffIndex={currentDiffIndex} diffFiles={assessmentData.diffFiles} />
				</PreviewComponent>
			)}
		</>
	);
};

export default AssessmentPage;
