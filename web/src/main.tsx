import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';
import './styles/index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ColorContext } from './contexts/color-context.tsx';
import { AppContextWrapper } from './contexts/app-context.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AssessmentPage from './components/assessment-page/assessment-page.tsx';
import Summary from './components/assessment-page/summary.tsx';
import Home from './components/home/home.tsx';
import { getAssessmentData, getFileDetails, GetFileDetailsParams, getFilesList, GetFilesListParams, getProjectInformation, getSuiteConfig, getSuiteFilesList, GetSuiteFilesListParams, getSummary } from './loaders.ts';
import SuitePage from './components/suite-page/suite-page.tsx';
import PreviewPage from './components/preview-page/preview-page.tsx';
import FileLists from './components/suite-page/file-lists.tsx';
import SuiteHome from './components/suite-page/suite-home.tsx';
import FilesOverview from './components/suite-page/files-overview.tsx';

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <div>404 Not Found</div>,
		loader: async () => {
			const projectInformation = await getProjectInformation();			
			return { projectInformation };
		},
		children: [
			{
				path: "/",
				element: <Home />,
				index: true,
				loader: async () => {
					const projectInformation = await getProjectInformation();			
					return { projectInformation };
				},
				handle: {
					crumb: () => {
						return [{
							path: '/',
							slug: 'Home',
						}];
					},
				},
			},
			{
				path: "/summary",
				element: <Summary />,
				loader: async () => {
					const summary = await getSummary();
					return { summary };
				},
				handle: {
					crumb: () => {
						return [
							{
								path: '/',
								slug: 'Home',
							},
							{
								path: '/summary',
								slug: 'Summary',
							}
						];
					},
				},
			},
			{
				path: "/assessment",
				element: <AssessmentPage />,
				loader: async () => {
					const assessmentData = await getAssessmentData();
					return { assessmentData };
				},
				handle: {
					crumb: () => {
						return [
							{
								path: '/',
								slug: 'Home',
							},
							{
								path: '/assessment',
								slug: 'Assessment',
							}
						];
					},
				},
			},
			{
				path: "/suite/:suiteSlug",
				element: <SuitePage />,
				loader: async ({ params }) => {
					const filesList = await getSuiteFilesList(params as GetSuiteFilesListParams);
					const suiteConfig = await getSuiteConfig(params.suiteSlug);
					return { 
						filesList,
						suiteSlug: params.suiteSlug,
						suiteConfig,
					};
				},
				handle: {
					crumb: ({ suiteSlug }: { suiteSlug: string; }) => {
						return [
							{
								path: '/',
								slug: 'Home',
							},
							{
								path: `/suite/${suiteSlug}`,
								slug: suiteSlug,
							}
						];
					},
				},
				children: [
					{
						path: "/suite/:suiteSlug",
						index: true,
						element: <SuiteHome />,
						loader: ({params}) => ({ suiteSlug: params.suiteSlug})
					},
					{
						path: "/suite/:suiteSlug/files",
						element: <FilesOverview />,
						loader: async ({ params }) => {
							const filesList = await getSuiteFilesList(params as GetSuiteFilesListParams);
							return { filesList };
						},
						handle: {
							crumb: ({ suiteSlug }: { suiteSlug: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/files`,
										slug: 'Files',
									}
								];
							}
						},
					},
					{
						path: "/suite/:suiteSlug/files/:typeOfFiles",
						element: <FileLists />,
						loader: async ({ params }) => {
							const files = await getFilesList(params as GetFilesListParams);
							
							return { 
								suiteSlug: params.suiteSlug,
								typeOfFiles: params.typeOfFiles,
								fileNames: files
							};
						},
						handle: {
							crumb: ({ suiteSlug, typeOfFiles }: { suiteSlug: string; typeOfFiles: string }) => {
								return [
									{
										path: `/suite/${suiteSlug}/files`,
										slug: 'Files',
									},
									{
										path: `/suite/${suiteSlug}/files/${typeOfFiles}`,
										slug: typeOfFiles,
									}
								];
							}
						},
					},
					{
						path: "/suite/:suiteSlug/files/:typeOfFiles/:fileName",
						element: <PreviewPage />,
						loader: async ({ params }) => {
							const file = await getFileDetails(params as GetFileDetailsParams);
							return {
								file,
								suiteSlug: params.suiteSlug,
								fileName: params.fileName,
								typeOfFiles: params.typeOfFiles,
							};
						},
						handle: {
							crumb: ({ fileName, suiteSlug, typeOfFiles }: { fileName: string; suiteSlug: string; typeOfFiles: string }) => {								
								return [
									{
										path: `/suite/${suiteSlug}/files`,
										slug: 'Files',
									},
									{
										path: `/suite/${suiteSlug}/files/${typeOfFiles}`,
										slug: typeOfFiles,
									},
									{
										path: `/suite/${suiteSlug}/files/${typeOfFiles}/${fileName}`,
										slug: fileName,
									}
								];
							},
						},
					},
				],
			},
		],
	},
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppContextWrapper>
			<ColorContext>
				<RouterProvider router={router} />
			</ColorContext>
		</AppContextWrapper>
	</React.StrictMode>,
);
