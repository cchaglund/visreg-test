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
import AssessmentPage from './pages/assessment-page/assessment-page.tsx';
import Summary from './pages/assessment-page/summary.tsx';
import Home from './pages/home-page/home-page.tsx';
import { getAssessmentData, getImageDetails, GetFileDetailsParams, getImagesList, GetImagesListParams, getProjectInformation, getSuiteConfig, getSuiteImagesList, GetSuiteImagesListParams, getSummary } from './loaders.ts';
import SuitePage from './pages/suite-page/suite-page.tsx';
import ImagePage from './pages/view-image-page/preview-page.tsx';
import ImageList from './pages/suite-page/image-list.tsx';
import SuiteHome from './pages/suite-page/suite-home/suite-home.tsx';
import ImagesOverview from './pages/suite-page/images-overview.tsx';
import { AssessmentData } from './pages/assessment-page/types';
import TestPage from './pages/test-page/test-page.tsx';

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
						return [ {
							path: '/',
							slug: 'Home',
						} ];
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
				path: "/assessment/:suiteSlug?",
				element: <AssessmentPage />,
				loader: async ({ params }) => {
					const assessmentData = await getAssessmentData(params.suiteSlug);
					return { assessmentData };
				},
				handle: {
					crumb: ({ assessmentData }: { assessmentData: AssessmentData; }) => {
						console.log(assessmentData);
						
						return [
							{
								path: '/',
								slug: 'Home',
							},
							// {
							// 	path: `/suite/${assessmentData?.suiteSlug}`,
							// 	slug: assessmentData?.suiteSlug,
							// },
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
					const imagesList = await getSuiteImagesList(params as GetSuiteImagesListParams);
					const suiteConfig = await getSuiteConfig(params.suiteSlug);

					return {
						imagesList,
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
						loader: ({ params }) => ({ suiteSlug: params.suiteSlug })
					},
					{
						path: "/suite/:suiteSlug/images",
						element: <ImagesOverview />,
						loader: async ({ params }) => {
							const imagesList = await getSuiteImagesList(params as GetSuiteImagesListParams);
							return { imagesList };
						},
						handle: {
							crumb: ({ suiteSlug }: { suiteSlug: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/images`,
										slug: 'Images',
									}
								];
							}
						},
					},
					{
						path: "/suite/:suiteSlug/test",
						element: <TestPage />,
						loader: async ({ params }) => {
							const imagesList = await getSuiteImagesList(params as GetSuiteImagesListParams);
							return { imagesList };
						},
						handle: {
							crumb: ({ suiteSlug }: { suiteSlug: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/test`,
										slug: 'Test',
									}
								];
							}
						},
					},
					{
						path: "/suite/:suiteSlug/images/:typeOfImage",
						element: <ImageList />,
						loader: async ({ params }) => {
							const images = await getImagesList(params as GetImagesListParams);

							return {
								suiteSlug: params.suiteSlug,
								typeOfImage: params.typeOfImage,
								imageNames: images
							};
						},
						handle: {
							crumb: ({ suiteSlug, typeOfImage }: { suiteSlug: string; typeOfImage: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/images`,
										slug: 'Images',
									},
									{
										path: `/suite/${suiteSlug}/images/${typeOfImage}`,
										slug: typeOfImage,
									}
								];
							}
						},
					},
					{
						path: "/suite/:suiteSlug/images/:typeOfImage/:fileName",
						element: <ImagePage />,
						loader: async ({ params }) => {
							const image = await getImageDetails(params as GetFileDetailsParams);
							return {
								image,
								suiteSlug: params.suiteSlug,
								fileName: params.fileName,
								typeOfImage: params.typeOfImage,
							};
						},
						handle: {
							crumb: ({ fileName, suiteSlug, typeOfImage }: { fileName: string; suiteSlug: string; typeOfImage: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/images`,
										slug: 'Images',
									},
									{
										path: `/suite/${suiteSlug}/images/${typeOfImage}`,
										slug: typeOfImage,
									},
									{
										path: `/suite/${suiteSlug}/images/${typeOfImage}/${fileName}`,
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
