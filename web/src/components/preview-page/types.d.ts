export type File = {
	name: string;
    fileName: string;
    createdAt: Date;
	modifiedAt: Date;
    type: string;
    suiteName: string;
	sizeString: string;
    url: string;
    siblingPaths: SiblingPath[];
    fileUrl: string;
};

export type SiblingPath = {
    type: 'baseline' | 'received' | 'diff';
    previewUrl: string;
};
