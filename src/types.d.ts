export type TestType = {
	name: string;
	slug: string;
	description: string;
};

export type ConfigurationOptions = {
	screenshotOptions: CypressScreenshotOptions; // https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
	comparisonOptions: JestMatchImageSnapshotOptions; // https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api
};


interface CypressScreenshotOptions {
	/**
	 * Array of string selectors used to match elements that should be blacked out when the screenshot is taken.
	 * Does not apply to element screenshot captures.
	 * @type {string[]}
	 * @default []
	 */
	blackout?: string[];

	/**
	 * Which parts of the Cypress Test Runner to capture.
	 * This value is ignored for element screenshot captures.
	 * Valid values are viewport, fullPage, or runner.
	 * When viewport, the application under test is captured in the current viewport.
	 * When fullPage, the application under test is captured in its entirety from top to bottom.
	 * When runner, the entire browser viewport, including the Cypress Command Log, is captured.
	 * For screenshots automatically taken on test failure, capture is always coerced to runner.
	 * When Test Replay is enabled and the Runner UI is hidden, a runner screenshot will not include the Runner UI
	 * and will instead capture the application under test only in the current viewport.
	 * @type {string}
	 * @default 'fullPage'
	 */
	capture?: 'viewport' | 'fullPage' | 'runner';

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
	 * @default null
	 * @property {number} x - The x-coordinate of the top-left corner of the cropped image.
	 * @property {number} y - The y-coordinate of the top-left corner of the cropped image.
	 * @property {number} width - The width of the cropped image.
	 * @property {number} height - The height of the cropped image.
	 */
	clip: {
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
	 * @default null
	 */
	padding:
		| number
		| [ number ]
		| [ number, number ]
		| [ number, number, number ]
		| [ number, number, number, number ];
	/**
	 * Whether to scale the app to fit into the browser viewport.
	 * This is always coerced to true for runner captures.
	 * @type {boolean}
	 * @default false
	 */
	scale?: boolean;

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
	timout?: {
		defaultCommandTimeout?: 4000,
		execTimeout?: 60000,
		taskTimeout?: 60000,
		pageLoadTimeout?: 60000,
		requestTimeout?: 5000,
		responseTimeout?: 30000
	};

	/**
	 * When true, automatically takes a screenshot when there is a failure during cypress run.
	 * @type {boolean}
	 * @default true
	 */
	screenshotOnRunFailure?: boolean;

	/**
	 * Whether to overwrite duplicate screenshot files with the same file name when saving.
	 * @type {boolean}
	 * @default false
	 */
	overwrite?: boolean;

	/**
	 * A callback before a (non-failure) screenshot is taken.
	 * For an element capture, the argument is the element being captured.
	 * For other screenshots, the argument is the $el.
	 * @type {Function}
	 * @default null
	 * @param {Object} $el - The element being captured.
	 */
	onBeforeScreenshot?: Function | null;

	/**
	 * A callback after a (non-failure) screenshot is taken.
	 * For an element capture, the first argument is the element being captured.
	 * For other screenshots, the first argument is the $el.
	 * The second argument is properties concerning the screenshot, including the path it was saved to
	 * and the dimensions of the saved screenshot.
	 * @type {Function}
	 * @default null
	 * @param {Object} $el - The element being captured.
	 * @param {Object} props - Properties concerning the screenshot, including the path it was saved to and the dimensions of the saved screenshot.
	 * @param {string} props.path - The path the screenshot was saved to.
	 * @param {number} props.size - The size of the screenshot in bytes.
	 * @param {Object} props.dimensions - The dimensions of the screenshot.
	 * @param {number} props.dimensions.width - The width of the screenshot.
	 * @param {number} props.dimensions.height - The height of the screenshot.
	 * @param {boolean} props.multipart - Whether the screenshot was saved as a multipart image.
	 * @param {number} props.pixelRatio - The pixel ratio of the screenshot.
	 * @param {string} props.takenAt - The time the screenshot was taken.
	 * @param {string} props.name - The name of the screenshot.
	 * @param {string[]} props.blackout - The selectors used to blackout parts of the screenshot.
	 * @param {number} props.duration - The duration of the screenshot command.
	 * @param {number} props.testAttemptIndex - The index of the test attempt.
	 * @see https://docs.cypress.io/api/cypress-api/screenshot-api#Arguments
	 */
	onAfterScreenshot?: Function | null;
}


interface JestMatchImageSnapshotOptions {
	/**
	 * If set to true, the build will not fail when the screenshots to compare have different sizes.
	 * @type {boolean | undefined}
	 * @default false
	 */
	allowSizeMismatch?: boolean | undefined;

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
	 * A custom name to give this snapshot. If not provided, one is computed automatically. When a function is provided
	 * it is called with an object containing testPath, currentTestName, counter and defaultIdentifier as its first
	 * argument. The function must return an identifier to use for the snapshot.
	 */
	customSnapshotIdentifier?:
	| ((parameters: {
		testPath: string;
		currentTestName: string;
		counter: number;
		defaultIdentifier: string;
	}) => string)
	| string
	| undefined;

	/**
	 * Changes diff image layout direction.
	 * @default 'horizontal'
	 */
	diffDirection?: "horizontal" | "vertical" | undefined;

	/**
	 * Either only include the difference between the baseline and the received image in the diff image, or include
	 * the 3 images (following the direction set by `diffDirection`).
	 * @default false
	 */
	onlyDiff?: boolean | undefined;

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
