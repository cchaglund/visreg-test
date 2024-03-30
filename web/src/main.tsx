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
import { getAssessmentData, getImageDetails, GetFileDetailsParams, getImagesList, GetImagesListParams, getProjectInformation, getSuiteConfig, getSuiteImagesList, GetSuiteImagesListParams, getSummary } from './loaders.ts';
import SuitePage from './components/suite-page/suite-page.tsx';
import PreviewPage from './components/preview-page/preview-page.tsx';
import ImageLists from './components/suite-page/image-lists.tsx';
import SuiteHome from './components/suite-page/suite-home.tsx';
import ImagesOverview from './components/suite-page/images-overview.tsx';
import { AssessmentData } from './components/assessment-page/types';

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
				path: "/assessment",
				element: <AssessmentPage />,
				loader: async () => {
					const assessmentData = await getAssessmentData();
					return { assessmentData };
				},
				handle: {
					crumb: ({ assessmentData }: { assessmentData: AssessmentData; }) => {
						return [
							{
								path: '/',
								slug: 'Home',
							},
							{
								path: `/suite/${assessmentData?.programChoices?.suite}`,
								slug: assessmentData?.programChoices?.suite,
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
						path: "/suite/:suiteSlug/images/:typeOfImage",
						element: <ImageLists />,
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
						element: <PreviewPage />,
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
