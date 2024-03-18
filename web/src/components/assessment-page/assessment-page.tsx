import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/app-context';
import Controls from './controls';
import Progress from './progress';
import { useLoaderData,	useNavigate } from 'react-router-dom';
import { AssessmentData, DiffObject } from './types';
import { getFileDetails } from '../../loaders';
import PreviewComponent from '../preview-page/preview-component';


const AssessmentPage = () => {
	const [ fileDeets, setFileDeets ] = useState(null);
	const [ currentDiff, setCurrentDiff ] = useState<DiffObject>();
	const navigate = useNavigate();
	const { serverBaseUrl, setSuiteName, setCurrentDiffIndex, currentDiffIndex } = useContext(AppContext);
	const { assessmentData } = useLoaderData() as { assessmentData: AssessmentData; };

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
			const fileDetails = await getFileDetails({ 
				suiteSlug: assessmentData.programChoices.suite,
				fileName: diff?.imageName + '.diff.png',
			});

			if (!fileDetails?.error) {
				setFileDeets(fileDetails);
				setCurrentDiff(diff);
			}
		}
		
		getFile();
	}, [assessmentData, currentDiff?.imageName, currentDiffIndex, setCurrentDiffIndex]);


	useEffect(() => {
		setSuiteName(assessmentData?.programChoices?.suite);
	}, [assessmentData?.programChoices?.suite, setSuiteName]);


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

		await fetch(serverBaseUrl + '/assessment/' + action, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ index: currentDiffIndex }),
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
		<div>
			{ fileDeets && (
				<PreviewComponent file={fileDeets}>
					<Controls doAssessAction={(action: string) => doAssessAction(action)} />
					<Progress currentDiffIndex={currentDiffIndex} diffFiles={assessmentData.diffFiles} />
				</PreviewComponent>
			)}

		</div>
	);
};

export default AssessmentPage;