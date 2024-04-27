import { Command } from 'commander';
import { CliProgramChoices, ProgramChoices, TestTypeSlug, VisregViewport } from './types';
import { createScaffold, parseViewport } from './utils';

export const initialCwd = process.cwd();

export const program = new Command();

program
	.option('-s, --suite <char>')
	.option('-e, --endpoint-titles <char>')
	.option('-v, --viewports <char>')
	.option('-f, --full-test [specs]')
	.option('-d, --diffs-only [specs]')
	.option('-a, --assess-existing-diffs [specs]')
	.option('-l, --lab-mode [specs]')
	.option('-t, --targetted [specs]')
	.option('-ng, --no-gui')
	.option('-ns, --no-snap')
	.option('-sc, --scaffold')
	.option('-sct, --scaffold-ts')
	.option('-ss, --server-start')
	.option('-c, --containerized') // This one is used internally, not exposed to the user

program.parse();

const extractProgramChoices = () => {
	const opts: CliProgramChoices = program.opts();

	if (opts.scaffold || opts.scaffoldTs) {
		createScaffold();
		process.exit();
	}

	let testType = '';
	let specificationShorthand: string | boolean = '';

	switch (true) {
		case opts.assessExistingDiffs !== undefined:
			testType = 'assess-existing-diffs';
			specificationShorthand = opts.assessExistingDiffs;
			break;
		case opts.labMode !== undefined:
			testType = 'lab';
			specificationShorthand = opts.labMode;
			break;
		case opts.diffsOnly !== undefined:
			testType = 'diffs-only';
			specificationShorthand = opts.diffsOnly;
			break;
		case opts.fullTest !== undefined:
			testType = 'full-test';
			specificationShorthand = opts.fullTest;
			break;
		case opts.targetted !== undefined:
			testType = 'targetted';
			specificationShorthand = opts.targetted;
			break;
	}	

	const targetViewportList = opts.viewports 
		? opts.viewports.split('+') as VisregViewport[]
		: [];

	const targetViewports = targetViewportList
		.map((vp) => parseViewport(vp))
		.filter((vp) => vp) as VisregViewport[];
	
	const targetEndpointTitles = opts.endpointTitles
		? opts.endpointTitles.split('+')
		: [];	
		
    const args: ProgramChoices = {
		suite: opts?.suite,
		targetEndpointTitles,
        targetViewports,
		testType: (testType as TestTypeSlug),
		gui: opts?.gui,
		snap: opts?.snap,
		containerized: opts?.containerized,
		serverStart: opts?.serverStart,
    };

    if (typeof specificationShorthand !== 'string') {
		return args;
	}

	return extractSpecificationShorthand(args, specificationShorthand);
}

const extractSpecificationShorthand = (args: ProgramChoices, specificationShorthand: string) => {	
	const shortSpec = specificationShorthand;
    const colonPosition = shortSpec.indexOf(':');
    const atPosition = shortSpec.indexOf('@') === -1 ? shortSpec.length : shortSpec.indexOf('@');	

    let suite = '';
    let endpointTitles = '';

    if (colonPosition > 0) {
        suite = shortSpec.substring(0, colonPosition);
        endpointTitles = shortSpec.substring(colonPosition + 1, atPosition);
    } else if (colonPosition === -1) {
		suite = shortSpec.substring(0, atPosition);
    } else {		
        endpointTitles = shortSpec.substring(1, atPosition);
    }

	const endpointTitlesList = endpointTitles ? endpointTitles.split('+') : [];

	const viewportsString = shortSpec.substring(atPosition + 1, shortSpec.length);
	const viewports = viewportsString 
		? viewportsString.split('+') as VisregViewport[]
		: [];

	const viewportsList = viewports
		.map((vp) => parseViewport(vp))
		.filter((vp) => vp) as VisregViewport[];
	
	const specifiedTargetEndpoint = endpointTitlesList;
	const specifiedViewport = viewportsList;

    const updatedArgs: ProgramChoices = {
		...args,
		suite: args.suite || suite,
        targetEndpointTitles : args.targetEndpointTitles.length ? args.targetEndpointTitles : specifiedTargetEndpoint,
		targetViewports : args.targetViewports.length ? args.targetViewports : specifiedViewport as VisregViewport[],
    }
	
    return updatedArgs;
}

export const programChoices: ProgramChoices = extractProgramChoices();
