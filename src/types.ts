import { cy as CypressCy } from 'local-cypress';

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to set the viewport to a specific device preset or [width, height].
			 * @example cy.setResolution('samsung-s10')
			 */
			setResolution(viewport: VisregViewport): Chainable<JQuery<HTMLElement>>;

			/**
			 * Custom command to capture the full page
			 * @example cy.prepareForCapture('/home', 'samsung-s10')
			 */
			prepareForCapture(args: PrepareForCaptureSettings): Chainable<JQuery<HTMLElement>>;

			/**
			 * Set the device pixel ratio for the test run.
			 * @param ratio 
			 * @param opts 
			 */
			setDevicePixelRatio(ratio: number): Chainable<JQuery<HTMLElement>>;

			waitForNetworkIdle(timeout: number): Chainable<JQuery<HTMLElement>>;
		}
	}
}

export declare function runVisreg(props: TestConfig): void;

export type RunTest = (props: TestConfig) => void;

export type SnapConfig = {
	path: string;
	viewportSize: Cypress.ViewportPreset | number[];
	title: string;
};

export type TestContext = {
	endpoint: Endpoint;
	viewport: VisregViewport;
	cypress: Cypress.Cypress;
	fullUrl: string;
	fullPageCapture?: boolean;
	visitOptions: VisitSettings,
	requestOptions?: RequestSettings;
}

export type EndpointHookFunction = (cy: typeof CypressCy, context: TestContext, globalParentHook?: EndpointHookFunction) => void;
export type ExcludeFromTestFunction = (cy: typeof CypressCy, context: TestContext) => boolean;

export type RequestSettings = {
	headers?: {
		[key: string]: string;
	};
	auth?: {
		username: string;
		password: string;
	};
};

/**
 * Represents an endpoint for visual regression testing.
 */
export type Endpoint = CypressScreenshotOptions & JestMatchImageSnapshotOptions & {
	/**
	 * The title of the endpoint.
	 * @example 'Home Page'
	 */
	title: string;
	/**
	 * The path of the endpoint.
	 * @example '/home'
	 */
	path: string;
	/**
	 * An array of CSS selectors to blackout in the screenshot.
	 * @example ['.cookie-banner', '.modal']
	 */
	blackout?: string[];
	/**
	 * The CSS selector of the element to match in the screenshot.
	 * @example '.header'
	 */
	elementToMatch?: string;
	/**
	 * The padding around the element to match in the screenshot.
	 */
	padding?: Cypress.Padding;
	/**
	 * The type of capture to perform: 'viewport' or 'fullPage'.
	 * @default 'fullPage'
	 */
	capture?: 'viewport' | 'fullPage';
	/**
	 * A function to exclude the endpoint from testing based on custom logic.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 * @returns {boolean} Whether to exclude the endpoint from testing.
	 * @example (cy, context) => context.viewport === 'samsung-s10'
	 */
	excludeFromTest?: ExcludeFromTestFunction;
	/**
	 * A function to execute before visiting the endpoint.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 * @param {EndpointHookFunction} globalParentHook - The global parent hook with the same signature.
	 * @example (cy, context, globalParentHook) => cy.get('.cookie-banner').click()
	 */
	onBeforeVisit?: EndpointHookFunction;
	/**
	 * A function to execute when visiting the endpoint.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 * @param {EndpointHookFunction} globalParentHook - The global parent hook with the same signature.
	 * @example (cy, context, globalParentHook) => cy.get('.modal').should('be.visible')
	 */
	onVisit?: EndpointHookFunction;
	/**
	 * A function to execute after visiting the endpoint.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 * @param {EndpointHookFunction} globalParentHook - The global parent hook with the same signature.
	 * @example (cy, context, globalParentHook) => cy.get('.modal').should('not.be.visible')
	 */
	onAfterVisit?: EndpointHookFunction;
	/**
	 * Additional data associated with the endpoint.
	 * @example { user: 'admin' }
	 */
	data?: any;
	/**
	 * The visit options for the endpoint.
	 * @example { waitForNetworkIdle: true }
	 */
	visitOptions?: VisitSettings;
	/**
	 * The request options for the endpoint.
	 * @example { headers: { 'Authorization
	 * : 'Bearer token
	 * ' } }
	 */
	requestOptions?: RequestSettings;
};

/**
 * Represents a viewport for visual regression testing.
 */
export type VisregViewport = Cypress.ViewportPreset | number[];

export type VisitSettings = {
	/**
	 * Whether to wait for network traffic before taking a screenshot.
	 * Uses https://github.com/bahmutov/cypress-network-idle
	 * @type {boolean}
	 * @default true
	 */
	waitForNetworkIdle?: boolean;

	/**
	 * Change the pixel density of the screenshot. 
	 * Mobile devices often have a pixel density of 2, and retina displays have a pixel density of 2 or 3.
	 * With the default value of 1, the screenshot will be the same size as the viewport.
	 * They will be noticeably lower resolution than what you'd see on a mobile device or retina display.
	 * Pros and cons of setting this to a higher value:
	 * - Screenshots resemble what you'd see on a mobile device or retina display.
	 * - Screenshot files sizes will be larger, and they will take longer to process and store
	 * 
	 * @type {number}
	 * @default 1
	 */
	devicePixelRatio?: number;

	/**
	 * Amount of time, in milliseconds, to scroll the page prior to taking screenshots (1 second down, 1 second up)
	 * When "capture" is set to "viewport", this time is halved.
	 * @type {number}
	 * @default 750
	 */
	scrollDuration?: number;

	/**
	 * Whether Cypress should fail on a non-2xx response code from your server.
	 * @type {boolean}
	 * @default true
	 */
	failOnStatusCode?: boolean;
};

/**
 * Represents the settings for preparing a capture.
 */
export type PrepareForCaptureSettings = {
	/**
	 * A function that will be called before visiting each endpoint.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 * @param {EndpointHookFunction} globalParentHook - The global parent hook with the same signature.
	 * @example (cy, context, globalParentHook) => cy.get('.cookie-banner').click()
	 */
	onVisit?: EndpointHookFunction;

	/**
	 * A function that will be called before visiting any endpoint.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 * @param {EndpointHookFunction} globalParentHook - The global parent hook with the same signature.
	 * @example (cy, context, globalParentHook) => cy.get('.cookie-banner').click()
	 */
	globalOnVisit: EndpointHookFunction;

	/**
	 * The test context.
	 */
	context: TestContext;
};

/**
 * Represents the configuration for a test.
 */
export type TestConfig = {
	/**
	 * The name of the test suite.
	 */
	suiteName?: string;
	
	/**
	 * The base URL for the test.
	 * @example 'https://developer.mozilla.org'
	 */
	baseUrl: string;
	
	/**
	 * The list of endpoints to visit during the test.
	 */
	endpoints: Endpoint[];
	
	/**
	 * The list of viewports to use during the test.
	 */
	viewports?: VisregViewport[];
	
	/**
	 * A function to format the URL for each endpoint.
	 * @param {string} path - The path of the endpoint.
	 * @returns {string} The formatted URL.
	 * @example (path) => `https://developer.mozilla.org${path}?utm_source=visreg-test`
	 */
	formatUrl?: (path: string) => string;
	
	/**
	 * A function to execute before visiting each endpoint.
	 * Gets overridden by the onBeforeVisit attribute of an endpoint object.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 */
	onBeforeVisit?: EndpointHookFunction;
	
	/**
	 * A function to execute when visiting each endpoint.
	 * Gets overridden by the onVisit attribute of an endpoint object.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 */
	onVisit?: EndpointHookFunction;
	
	/**
	 * A function to execute after visiting each endpoint.
	 * Gets overridden by the onAfterVisit attribute of an endpoint object.
	 * @param {Cypress} cy - The Cypress object.
	 * @param {TestContext} context - The context of the test.
	 */
	onAfterVisit?: EndpointHookFunction;
};

export type TestTypeSlug = 'full-test' | 'diffs-only' | 'targetted' | 'lab' | 'assess-existing-diffs';

export type TestType = {
	name: string;
	slug: TestTypeSlug;
	description: string;
};

export type TestSettings = {
    testType: TestTypeSlug;
    diffList: string[];
    suite?: string;
	targetEndpointTitles?: string[];
	targetViewports?: VisregViewport[];
	noSnap?: boolean;
}

export type ProgramChoices = {
	suite?: string,
	targetEndpointTitles: string[] | [],
	targetViewports: (VisregViewport | [])[],
	fullTest?: boolean | string,
	diffsOnly?: boolean | string,
	assessExistingDiffs?: boolean | string,
	targetted?: boolean | string,
	testType: TestTypeSlug,
	gui?: boolean,
	snap?: boolean,
	scaffold?: boolean,
	scaffoldTs?: boolean,
	containerized?: boolean,
	serverStart?: boolean,
	webTesting?: boolean,
}

export type CliProgramChoices = ProgramChoices & {
	viewports?: string;
	endpointTitles?: string;
	labMode?: boolean,
}


export type ConfigurationSettings = {
	/**
	 * Request options to be included in the request of every endpoint.
	 * @type {Object}
	 */
	requestOptions?: RequestSettings;

	/**
	 * Visit options to be included in the visit of every endpoint.
	 * @type {Object}
	 */
	visitOptions?: VisitSettings;

	/**
	* These will not be included in the selection of test suites.
	* @type {string[]}
	*/
	ignoreDirectories?: string[];

	/**
	 * maxViewport sets the maximum viewport dimensions that will be used for screenshots. 
	 * If you define a viewport in your tests that is larger than these values, it will be cropped to these values.
	 * I.e. the screenshot will not be the full viewport size.
	 * @type {Object}
	 */
	maxViewport?: {
		width?: number;
		height?: number;
	};

	/**
	 * This is for Linux users to specify the image preview program they are using.
	 * It is used to automatically close the previewer at the end of diff assessment with a `pkill` command. 
	 * By default visreg-test will attempt to close Gnome (i.e. 'pkill eog').
	 * @type {string}
	 * @default 'eog'
	 */	
	imagePreviewProcess?: string;

	/**
	 * Prevent visreg-test from attempting to automatically close the image previewer at the end of diff assessment. 
	 * @type {boolean}
	 * @default false
	 */
	disableAutoPreviewClose?: boolean;

	/**
	 * Browser to use for the test run.
	 * @type {string}
	 */
	browser?: 'chrome' | 'firefox' | 'edge' | 'electron';

	screenshotOptions?: CypressScreenshotOptions; // https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
	comparisonOptions?: JestMatchImageSnapshotOptions; // https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api
};

export type NonOverridableSettings = {
	suitesDirectory: string;
	useRelativeSnapshotsDir: true,
	storeReceivedOnFailure: true,
	snapFilenameExtension: '.lab' | '.base',
	customSnapshotsDir: 'lab' | '',
}

export type VisregOptions = CypressScreenshotOptions & JestMatchImageSnapshotOptions;


export type CypressScreenshotOptions = {
	/**
	 * Array of string selectors used to match elements that should be blacked out when the screenshot is taken.
	 * Does not apply to element screenshot captures.
	 * Is replaced by the individual blackout option attribute of an endpoint object if it exists. TODO: make them work together instead of replacing.
	 * @type {string[]}
	 * @default []
	 */
	blackout?: string[];

	/**
     * Valid values are viewport or fullPage.
	 * When fullPage, the application under test is captured in its entirety from top to bottom.
	 * This value is ignored for element screenshot captures.
	 * @type {string}
	 * @default 'fullPage'
	 */
	capture?: 'viewport' | 'fullPage';

	/**
	 * When true, prevents JavaScript timers (setTimeout, setInterval, etc) and CSS animations from running while the screenshot is taken.
	 * This is set to false by default and the resulting snapshot may more closely resemble a visitor's experience than when set to true.
	 * If you for example have images that lazy-load, use IntersectionObserver to load them, and animate in when loaded, these will render/load properly.
	 * You may get more inconsistent results when set to false, since timers and animations are allowed to run.
	 * This setting is highly dependent on what is being tested, but having it set to false per default results in a more expected experience.
	 * Tests will take slighly longer when set to false because a certain amount of time is allowed to pass before the screenshot is taken, to allow for animations to finish.
	 * @type {boolean}
	 * @default false
	 */
	disableTimersAndAnimations?: boolean;

	/**
	 * Position and dimensions (in pixels) used to crop the final screenshot image. 
	 * @type {Object}
	 * @property {number} x - The x-coordinate of the top-left corner of the cropped image.
	 * @property {number} y - The y-coordinate of the top-left corner of the cropped image.
	 * @property {number} width - The width of the cropped image.
	 * @property {number} height - The height of the cropped image.
	 */
	clip?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};

	/**
	 * Padding used to alter the dimensions of a screenshot of an element. 
	 * It can either be a number, or an array of up to four numbers using CSS shorthand notation. 
	 * This property is only applied for element screenshots and is ignored for all other types.
	 * @type {number | [number] | [number, number] | [number, number, number] | [number, number, number, number]}
	 */
	padding?:
	| number
	| [ number ]
	| [ number, number ]
	| [ number, number, number ]
	| [ number, number, number, number ];

	/**
	 * Time to wait for .screenshot() to resolve before timing out
	 * @type {Object}
	 * @property {number} defaultCommandTimeout - Time, in milliseconds, to wait until most DOM based commands are considered timed out.
	 * @property {number} execTimeout - Time, in milliseconds, to wait for a system command to finish executing during a cy.exec() command.
	 * @property {number} taskTimeout - Time, in milliseconds, to wait for a task to finish executing during a cy.task() command.
	 * @property {number} pageLoadTimeout - Time, in milliseconds, to wait for page transition events or cy.visit(), cy.go(), cy.reload() commands to fire their page load events. Network requests are limited by the underlying operating system, and may still time out if this value is increased.
	 * @property {number} requestTimeout - Time, in milliseconds, to wait for a request to go out in a cy.wait() command.
	 * @property {number} responseTimeout - Time, in milliseconds, to wait until a response in a cy.request(), cy.wait(), cy.fixture(), cy.getCookie(), cy.getCookies(), cy.setCookie(), cy.clearCookie(), cy.clearCookies(), and cy.screenshot() commands.
	 * @see https://docs.cypress.io/guides/references/configuration.html#Timeouts
	 */
	timeouts?: {
		defaultCommandTimeout?: 4000,
		execTimeout?: 60000,
		taskTimeout?: 60000,
		pageLoadTimeout?: 60000,
		requestTimeout?: 5000,
		responseTimeout?: 30000;
	};
};


export type JestMatchImageSnapshotOptions = {
	/**
	 * Custom config passed to 'pixelmatch' or 'ssim'
	 */
	customDiffConfig?: {
		/**
		 * Matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive.
		 * @default 0.01
		 */
		readonly threshold?: number | undefined;

		/**
		 * If true, disables detecting and ignoring anti-aliased pixels.
		 * @default false
		 */
		readonly includeAA?: boolean | undefined;

		/**
		 * Blending factor of unchanged pixels in the diff output.
		 * Ranges from 0 for pure white to 1 for original brightness
		 * @default 0.1
		 */
		alpha?: number | undefined;

		/**
		 * The color of anti-aliased pixels in the diff output.
		 * @default [255, 255, 0]
		 */
		aaColor?: [ number, number, number ] | undefined;

		/**
		 * The color of differing pixels in the diff output.
		 * @default [255, 0, 0]
		 */
		diffColor?: [ number, number, number ] | undefined;

		/**
		 * An alternative color to use for dark on light differences to differentiate between "added" and "removed" parts.
		 * If not provided, all differing pixels use the color specified by `diffColor`.
		 * @default null
		 */
		diffColorAlt?: [ number, number, number ] | undefined;

		/**
		 * Draw the diff over a transparent background (a mask), rather than over the original image.
		 * Will not draw anti-aliased pixels (if detected)
		 * @default false
		 */
		diffMask?: boolean | undefined;
	} | Partial<{
		rgb2grayVersion: 'original' | 'integer';
		k1: number;
		k2: number;
		ssim: 'fast' | 'original' | 'bezkrovny' | 'weber';
		windowSize: number;
		bitDepth: number;
		downsample: 'original' | 'fast' | false;
		maxSize?: number;
	}> | undefined;

	/**
	 * The method by which images are compared.
	 * `pixelmatch` does a pixel by pixel comparison, whereas `ssim` does a structural similarity comparison.
	 * @default 'pixelmatch'
	 */
	comparisonMethod?: "pixelmatch" | "ssim" | undefined;

	/**
	 * Changes diff image layout direction.
	 * @default 'horizontal'
	 */
	diffDirection?: "horizontal" | "vertical" | undefined;

	// /**
	//  * This needs to be set to a existing file, like `require.resolve('./runtimeHooksPath.cjs')`.
	//  * This file can expose a few hooks:
	//  * - `onBeforeWriteToDisc`: before saving any image to the disc, this function will be called (can be used to write EXIF data to images for instance)
	//  * - `onBeforeWriteToDisc: (arguments: { buffer: Buffer; destination: string; testPath: string; currentTestName: string }) => Buffer`
	//  */
	// runtimeHooksPath?: string | undefined;

	// /**
	//  * Will output base64 string of a diff image to console in case of failed tests (in addition to creating a diff image).
	//  * This string can be copy-pasted to a browser address string to preview the diff for a failed test.
	//  * @default false
	//  */
	// dumpDiffToConsole?: boolean | undefined;

	// /**
	//  * Will output the image to the terminal using iTerm's Inline Images Protocol.
	//  * If the term is not compatible, it does the same thing as `dumpDiffToConsole`.
	//  * @default false
	//  */
	// dumpInlineDiffToConsole?: boolean | undefined;

	/**
	 * Removes coloring from the console output, useful if storing the results to a file.
	 * @default false.
	 */
	noColors?: boolean | undefined;

	/**
	 * Sets the threshold that would trigger a test failure based on the failureThresholdType selected. This is different
	 * to the customDiffConfig.threshold above - the customDiffConfig.threshold is the per pixel failure threshold, whereas
	 * this is the failure threshold for the entire comparison.
	 * @default 0.001
	 */
	failureThreshold?: number | undefined;

	/**
	 * Sets the type of threshold that would trigger a failure.
	 * @default 'pixel'.
	 */
	failureThresholdType?: "pixel" | "percent" | undefined;

	/**
	 * Applies Gaussian Blur on compared images, accepts radius in pixels as value. Useful when you have noise after
	 * scaling images per different resolutions on your target website, usually setting its value to 1-2 should be
	 * enough to solve that problem.
	 * @default 0.
	 */
	blur?: number | undefined;
}

