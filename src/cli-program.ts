import { Command } from 'commander';
import { ProgramChoices } from './types';
import { createScaffold, parsedViewport } from './utils';

export const program = new Command();

program
	.option('-s, --suite <char>')
	.option('-e, --endpoint-title <char>')
	.option('-v, --viewport <char>')
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
	const opts: ProgramChoices = program.opts();

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
	
    const args: ProgramChoices = {
		suite: opts?.suite,
		endpointTitle: opts?.endpointTitle,
        viewport: parsedViewport(opts?.viewport),
		testType,
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
    let endpointTitle = '';

    if (colonPosition > 0) {
        suite = shortSpec.substring(0, colonPosition);
        endpointTitle = shortSpec.substring(colonPosition + 1, atPosition);
    } else if (colonPosition === -1) {
		suite = shortSpec.substring(0, atPosition);
    } else {		
        endpointTitle = shortSpec.substring(1, atPosition);
    }

    const viewport = parsedViewport(shortSpec.substring(atPosition + 1, shortSpec.length));

    const updatedArgs = {
		...args,
		suite: args.suite || suite,
        endpointTitle : args.endpointTitle || endpointTitle,
        viewport : args.viewport || viewport,
    }

    return updatedArgs;
}

export const programChoices: ProgramChoices = extractProgramChoices();