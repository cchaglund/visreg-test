import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';
import './styles/index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeContext } from './contexts/theme-context.tsx';
import { AppContextWrapper } from './contexts/app-context.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AssessmentPage from './pages/assessment-page/assessment-page.tsx';
import AssessmentSummary from './pages/assessment-page/assessment-summary.tsx';
import Home from './pages/home-page/home-page.tsx';
import { getAssessmentData, getImageDetails, GetFileDetailsParams, getImagesList, GetImagesListParams, getProjectInformation, getSuiteConfig, getSuiteImagesList, getSummary, getDocs } from './loaders-and-fetchers.ts';
import SuitePage from './pages/suite-page/suite-page.tsx';
import PreviewPage from './pages/view-image-page/preview-page.tsx';
import ImageList from './pages/suite-page/image-list.tsx';
import SuiteHome from './pages/suite-page/suite-home/suite-home.tsx';
import ImagesOverview from './pages/suite-page/images-overview.tsx';
import TestPage from './pages/test-page/test-page.tsx';
import { TestContextWrapper } from './contexts/test-context.tsx';
import DocsPage from './pages/docs-page/docs-page.tsx';
import HistoryPage from './pages/history/history-page.tsx';

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
				path: "/docs",
				element: <DocsPage />,
				index: true,
				loader: async () => {					
					const docs = await getDocs();
					return { docs };
				},
				handle: {
					crumb: () => {
						return [ {
							path: '/docs',
							slug: 'Docs',
						} ];
					},
				},
			},
			{
				path: "/summary",
				element: <AssessmentSummary />,
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
				path: "/suite/:suiteSlug",
				element: <SuitePage />,
				loader: async ({ params }) => {
					const suiteConfig = await getSuiteConfig(params.suiteSlug);

					return {
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
						element: (<SuiteHome />),
						loader: async ({ params }) => {
							const imagesList = await getSuiteImagesList(params.suiteSlug);

							return { 
								suiteSlug: params.suiteSlug,
								imagesList,
							}
						}
					},
					{
						path: "/suite/:suiteSlug/images",
						element: <ImagesOverview />,
						loader: async ({ params, request }) => {
							const url = new URL(request.url);
							const gallerySubset = url.searchParams.get('gallery-subset');
							const imagesList = await getSuiteImagesList(params.suiteSlug);

							return { 
								imagesList, 
								suiteSlug: params.suiteSlug,
								gallerySubset: gallerySubset ? JSON.parse(gallerySubset) : null,
							};
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
						path: "/suite/:suiteSlug/assessment",
						element: <AssessmentPage />,
						loader: async ({ params, request }) => {							
							const url = new URL(request.url);

							const diffList = url.searchParams.get('diff-list-subset');
							const diffListSubset = diffList ? JSON.parse(diffList) : null;
							const resume = url.searchParams.get('resume') === 'true';

							const assessmentData = await getAssessmentData(params.suiteSlug, diffListSubset, resume);
							return { assessmentData };
						},
						handle: {
							crumb: ({ suiteSlug }: { suiteSlug: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/assessment`,
										slug: 'Assessment',
									}
								];
							},
						},
					},
					{
						path: "/suite/:suiteSlug/run-test",
						element: (
							<TestContextWrapper>
								<TestPage />
							</TestContextWrapper>
						),
						loader: async ({ params }) => {
							const imagesList = await getSuiteImagesList(params.suiteSlug);
							const suiteConfig = await getSuiteConfig(params.suiteSlug);

							return {imagesList, suiteConfig };
						},
						handle: {
							crumb: ({ suiteSlug }: { suiteSlug: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/run-test`,
										slug: 'Run test',
									}
								];
							}
						},
					},
					{
						path: "/suite/:suiteSlug/history",
						element: (
							<TestContextWrapper>
								<HistoryPage />
							</TestContextWrapper>
						),
						loader: async ({ params }) => {
							const suiteConfig = await getSuiteConfig(params.suiteSlug);
							const projectInformation = await getProjectInformation();

							return {suiteConfig, projectInformation };
						},
						handle: {
							crumb: ({ suiteSlug }: { suiteSlug: string; }) => {
								return [
									{
										path: `/suite/${suiteSlug}/history`,
										slug: 'History',
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
						element: <PreviewPage />,
						loader: async ({ params }) => {
							const image = await getImageDetails(params as GetFileDetailsParams);
							const imagesList = await getSuiteImagesList(params.suiteSlug);

							return {
								image,
								imagesList,
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
			<ThemeContext>
				<RouterProvider router={router} />
			</ThemeContext>
		</AppContextWrapper>
	</React.StrictMode>,
);
