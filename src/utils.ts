import * as fs from 'fs';
import * as path from 'path';
import { program, programChoices } from './cli';
import { ConfigurationSettings, Endpoint, VisregViewport } from './types';
import { EndpointTestResult, EndpointTestResultsGroup, SummaryObject } from './visreg';

type AgendaType = {
	viewportsToTest: VisregViewport[],
	endpointsToTest: Endpoint[],
};

export const projectRoot = process.cwd();

export const suitesDirectory = path.join(projectRoot, 'suites');

export const getSuiteDirOrFail = (suiteName?: string) => {
	if (!suiteName) {
		return '';
	}

	const specDir = path.join(suitesDirectory, suiteName);

	if (!fs.existsSync(specDir)) {
		printColorText('No suite path - see README', '31');
		process.exit(1);
	}
	
	const files = fs.readdirSync(specDir);
	const snapsFile = files.find(file => file.startsWith('snaps'));
	if (!snapsFile) {
		printColorText('No snap.js/ts file found - see README', '31');
		process.exit(1);
	}

	return specDir;
};

export const pathExists = (dirPath: string) => {
	return fs.existsSync(dirPath);
}

export const hasFiles = (dirPath: string) => fs.readdirSync(dirPath).length > 0;

export const parseViewport = (viewport?: VisregViewport) => {
	if (!viewport) {
		return;
	}

	const stringedViewport = viewport.toString();
	if (!stringedViewport?.includes(',')) {
		return viewport;
	}

	return stringedViewport.split(',').map((pixels: string) => parseInt(pixels))
}

export const createScaffold = () => {
	const typescript = program.opts().scaffoldTs;
	const scaffoldRoot = path.join(__dirname, 'scaffold');
	const fileName = typescript ? 'snaps.ts' : 'snaps.js';
	const source = path.join(scaffoldRoot, fileName);
	
	if (!pathExists(suitesDirectory)) {		
		fs.mkdirSync(suitesDirectory);
	}

	const destination = path.join(suitesDirectory, 'test-suite');

	if (!pathExists(destination)) {
		fs.mkdirSync(destination);
	}

	fs.copyFileSync(source, path.join(destination, fileName));

	if (typescript) {
		fs.copyFileSync(path.join(scaffoldRoot, 'tsconfig-scaffold.json'), path.join(projectRoot, 'tsconfig.json'));
	}
}

export const removeDirIfEmpty = (dirPath: string) => {
    if (!pathExists(dirPath) || hasFiles(dirPath)) {
		return;
	}

	try {
		fs.rmSync(dirPath, { recursive: true })
    } catch (err) {
        console.error(err);
    }
}

export const printColorText = (text: string, colorCode: string) => {
	console.log(`\x1b[${ colorCode }m${ text }\x1b[0m`);
};

export const getFileInfo = (filePath: string) => {
    const stats = fs.statSync(filePath);
    return {
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        sizeInBytes: stats.size
    };
}

export const getHumanReadableFileSize = (filePath: string) => {
	const {sizeInBytes} = getFileInfo(filePath);
	const fileSizeInMegabytes = sizeInBytes / 1000000.0;
	return fileSizeInMegabytes.toFixed(2) + 'MB';
}

export const SUITE_SNAPS_DIR = () => path.join(suitesDirectory, programChoices.suite || '', 'snapshots', 'snaps');
export const DIFF_DIR = () => path.join(SUITE_SNAPS_DIR(), '__diff_output__');
export const BACKUP_DIFF_DIR = () => path.join(SUITE_SNAPS_DIR(), 'backup-diffs');
export const RECEIVED_DIR = () => path.join(SUITE_SNAPS_DIR(), '__received_output__');
export const BACKUP_RECEIVED_DIR = () => path.join(SUITE_SNAPS_DIR(), 'backup-received');

export const removeBackups = () => {
	pathExists(BACKUP_DIFF_DIR()) && fs.rmSync(BACKUP_DIFF_DIR(), { recursive: true });
	pathExists(BACKUP_RECEIVED_DIR()) && fs.rmSync(BACKUP_RECEIVED_DIR(), { recursive: true });
}

export const cleanUp = () => {
	removeBackups();
	removeDirIfEmpty(DIFF_DIR());
	removeDirIfEmpty(RECEIVED_DIR());
}

export const getFilesInDir = (dirPath: string) => {
	if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath).filter((item) => {
        return fs.statSync(path.join(dirPath, item)).isFile();
    });
}

// Function to get directories
export const getDirectories = (source: string): string[] => {
	if (!fs.existsSync(source)) return [];
	return fs.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);
}

export const getSuites = () => {
	const configPath = path.join(projectRoot, 'visreg.config.json');
	let visregConfig: ConfigurationSettings = {};

	if (pathExists(configPath)) {
		const fileContent = fs.readFileSync(configPath, 'utf-8');
		try {
			visregConfig = JSON.parse(fileContent);
		} catch (e) {}
	}

	let ignoreDirectories: string[] = [];
	
	if (visregConfig.ignoreDirectories) {
		ignoreDirectories.push(...visregConfig.ignoreDirectories);
	}
	
	const suites: string[] = getDirectories(suitesDirectory)
		.filter(dirName => !ignoreDirectories.includes(dirName))
		.filter(dirName => {
			const fileName = 'snaps';
			return (
				fs.existsSync(path.join(suitesDirectory, dirName, fileName + '.js')) ||
				fs.existsSync(path.join(suitesDirectory, dirName, fileName + '.ts'))
			);
		})


	return suites;
}

export const getFileNameWithoutExtension = (fileName: string) => {
	const cleanName = fileName.replace(/(-received|.diff|.base)?\.png$/, '');
	return cleanName;
}

export const getAllDiffingFiles = () => {
	const allFiles = getFilesInDir(DIFF_DIR());
	const allDiffingFiles = allFiles.filter(file => file.endsWith('.diff.png'));
	return allDiffingFiles;
}

export const getDiffingFilesFromTestResult = () => {
	if (!pathExists(DIFF_DIR())) return [];
	
	return fs.readdirSync(DIFF_DIR())
		.filter(file => {
			if (isTargettedTest()) {
				return includedInTarget(file)
			}

			return true;
		})
		.filter(file => file.endsWith('.diff.png'));
}

export const getFileType = (fileName: string) => {
	if (fileName.endsWith('.diff.png')) {
		return 'diff';
	}

	if (fileName.endsWith('-received.png')) {
		return 'received';
	}

	return 'baseline';
}

export const isTargettedTest = () => !!(programChoices.targetViewports.length || programChoices.targetEndpointTitles.length);

export const includedInTarget = (fileName: string) => {
	let viewportScreeningPassed = true
	let endpointScreeningPassed = true

	const { targetViewports, targetEndpointTitles } = programChoices;

	if (targetViewports.length) {
		viewportScreeningPassed = !!targetViewports.find(targetVp => {			
			return fileName.includes(targetVp.toString())
		});
	}	

	if (targetEndpointTitles.length) {
		endpointScreeningPassed = !!targetEndpointTitles.find(targetEp => {
			const lowercaseTargetEp = targetEp.toLowerCase().replace(/ /g, '-');
			const filenameLowercaseAndReplacedSpaces = fileName.toLowerCase().replace(/ /g, '-');
			
			return filenameLowercaseAndReplacedSpaces.includes(lowercaseTargetEp);
		});
	}	
	
	return viewportScreeningPassed && endpointScreeningPassed;
}

export const parseCypressSummary = (data: string) => {
	const summaryObject: SummaryObject = {}

	data.split('\n').slice(1, -1).forEach((line: string) => {
		const text = line.match(/[a-zA-Z]+/)?.[0];
		const number = line.match(/\d+/)?.[0];

		if (text && number) {
			summaryObject[(text.toLowerCase() as keyof SummaryObject)] = parseInt(number);
		}
	});

	return summaryObject
};

export const parseAgenda = (data: string) => {
	const agendaData: AgendaType = JSON.parse(data);

	return agendaData.endpointsToTest.map(endpoint => {
		return agendaData.viewportsToTest.map(viewport => `${endpoint.title} @ ${viewport.toString()}`).join(', ');
	});
}

export const getSkippedEndpoints = (endpointTestResults: EndpointTestResultsGroup, testAgenda: string[]) => {
	const skipped = testAgenda
		.filter(endpoint => {
			const passed = endpointTestResults.passing.find(e => e.testTitle === endpoint);
			const failed = endpointTestResults.failing.find(e => e.testTitle === endpoint);			
			const tested = passed || failed;

			if (!tested) return true;
		})
		.map(endpoint => {
			const [ endpointTitle, viewport ] = endpoint.split(' @ ');

			const skippedEndpoint: EndpointTestResult = {
				testTitle: endpoint,
				endpointTitle,
				viewport,
			};

			return skippedEndpoint;
		});

	return skipped;
};


export const getUnchangedEndpoints = (endpointTestResults: EndpointTestResultsGroup) => {
	const diffList = getDiffingFilesFromTestResult();

    const unchanged = endpointTestResults.passing.filter(endpoint => {
        return !diffList.some(diffTitle => {
            return endpoint.testTitle === diffTitle.replace('.diff.png', '');
        });
    })

	return unchanged;
}

export const createFailingEndpointTestResult = (payload: string, errorSignature: RegExp) => {
	// E.g. "1) suiteSlug - endpointTitle @ viewport: error message"
	const errorMessages: string[] = payload.split(errorSignature);

	let userTerminated = false;
	const failingEndpoints = [];

	for (const [index, message] of errorMessages.entries()) {
		if (index === 0 || index % 2 !== 0) continue;
		
		const splitIndex = message.indexOf(':');
		const roughTestTitle = message.substring(0, splitIndex).trim();
		const testTitle = roughTestTitle.substring(roughTestTitle.lastIndexOf('\n')).trim();

		// This Cypress error message occurs when the user terminates the running test, so it's not a real error
		if (testTitle.match(/"before each" hook/)) {
			userTerminated = true;
			return { userTerminated, failingEndpoints };
		}
		
		const atSymbolIndex = testTitle.indexOf('@');
		const endpointTitle = testTitle.substring(0, atSymbolIndex).trim();
		const viewport = testTitle.substring(atSymbolIndex + 1).trim();
		const errorMessage = message.substring(splitIndex + 1).trim();

		const failedEndpoint: EndpointTestResult = {
			testTitle,
			errorMessage,
			endpointTitle,
			viewport,
		};

		failingEndpoints.push(failedEndpoint);
	}

	return { userTerminated, failingEndpoints };
}

export const createPassingEndpointTestResult = (payload: string) => {
	// E.g. "✓ Start @ samsung-s10 (6090ms)"
	const testTitle = payload.replace(/✓| \(\d+ms\)/g, '').trim();
	const [ endpointTitle, viewport ] = testTitle.split(' @ ');

	const passedEndpoint: EndpointTestResult = {
		testTitle,
		endpointTitle,
		viewport,
	};

	return passedEndpoint;
}

