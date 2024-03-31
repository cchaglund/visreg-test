export type DiffFilesType = DiffObject[] | [];

export type AssessmentData = {
	suiteSlug: string;
	diffFiles: DiffFilesType;
};

export type DiffObject = {
	imageName: string;
	recievedSizeString: string;
	baselineModified: Date;
	index: number;
	total: number;
	files: {
		baseline: {
			location: string;
			fileName: string;
		},
		received: {
			location: string;
			fileName: string;
		},
		diff: {
			location: string;
			fileName: string;
		}
	}
};
