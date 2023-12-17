import { cy as originalCy } from 'local-cypress';

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
		}
	}
}

export declare function run(props: TestProps): void;

export type CypressCy = typeof originalCy;

export type RunTest = (props: TestProps) => void;

export type SnapConfig = {
	path: string;
	size: Cypress.ViewportPreset | number[];
	title: string;
};

export type Endpoint = {
	title: string;
	path: string;
	blackout?: string[];
	elementToMatch?: string;
	padding?: Cypress.Padding;
	capture?: 'viewport' | 'fullPage';
	onEndpointVisit?: () => void;
};

export type VisregViewport = Cypress.ViewportPreset | number[];

export type PrepareForCaptureSettings = {
	fullUrl: string;
	viewport: VisregViewport;
	onPageVisitFunctions?: ((() => void) | undefined)[];
	skipScrolling?: boolean;
};


export type TestProps = {
	suiteName: string;
	baseUrl: string;
	endpoints: Endpoint[];
	viewports?: VisregViewport[];
	formatUrl?: (path: string) => string;
	onPageVisit?: () => void;
};

export type TestType = {
	name: string;
	slug: string;
	description: string;
};


export type ConfigurationOptions = {
	/**
	 * Relative or absolute path to directory of test suites. Default is the root of the project,
     * where package.json is.
	 */
	testDirectory: string;
	/**
	* These will not be included in the selection of test suites. node_modules is always ignored
	*/
	ignoreDirectories: string[];
	screenshotOptions: CypressScreenshotOptions; // https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
	comparisonOptions: JestMatchImageSnapshotOptions; // https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api
};


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
	 * When true, prevents JavaScript timers (setTimeout, setInterval, etc) and CSS animations from running
	 * while the screenshot is taken.
	 * @type {boolean}
	 * @default true
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
		 * @default 0.1
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

	/**
	 * This needs to be set to a existing file, like `require.resolve('./runtimeHooksPath.cjs')`.
	 * This file can expose a few hooks:
	 * - `onBeforeWriteToDisc`: before saving any image to the disc, this function will be called (can be used to write EXIF data to images for instance)
	 * - `onBeforeWriteToDisc: (arguments: { buffer: Buffer; destination: string; testPath: string; currentTestName: string }) => Buffer`
	 */
	runtimeHooksPath?: string | undefined;

	/**
	 * Will output base64 string of a diff image to console in case of failed tests (in addition to creating a diff image).
	 * This string can be copy-pasted to a browser address string to preview the diff for a failed test.
	 * @default false
	 */
	dumpDiffToConsole?: boolean | undefined;

	/**
	 * Will output the image to the terminal using iTerm's Inline Images Protocol.
	 * If the term is not compatible, it does the same thing as `dumpDiffToConsole`.
	 * @default false
	 */
	dumpInlineDiffToConsole?: boolean | undefined;

	/**
	 * Removes coloring from the console output, useful if storing the results to a file.
	 * @default false.
	 */
	noColors?: boolean | undefined;

	/**
	 * Sets the threshold that would trigger a test failure based on the failureThresholdType selected. This is different
	 * to the customDiffConfig.threshold above - the customDiffConfig.threshold is the per pixel failure threshold, whereas
	 * this is the failure threshold for the entire comparison.
	 * @default 0.
	 */
	failureThreshold?: number | undefined;

	/**
	 * Sets the type of threshold that would trigger a failure.
	 * @default 'pixel'.
	 */
	failureThresholdType?: "pixel" | "percent" | undefined;

	/**
	 * Updates a snapshot even if it passed the threshold against the existing one.
	 * @default false.
	 */
	updatePassedSnapshot?: boolean | undefined;

	/**
	 * Applies Gaussian Blur on compared images, accepts radius in pixels as value. Useful when you have noise after
	 * scaling images per different resolutions on your target website, usually setting its value to 1-2 should be
	 * enough to solve that problem.
	 * @default 0.
	 */
	blur?: number | undefined;
}

