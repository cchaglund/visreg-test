import * as path from 'path';

export const getSuiteImageDirectories = (suiteSlug: string, req: { local: { suitesDirectory: string;}}) => {
    const snapsDir = path.join(req.local.suitesDirectory, suiteSlug, 'snapshots', 'snaps');
    const diffDir = path.join(snapsDir, '__diff_output__');
    const receivedDir = path.join(snapsDir, '__received_output__');

    const imageDirectories = {
        baselines: snapsDir,
        diffs: diffDir,
        receivedImages: receivedDir
    };

    return imageDirectories;
}

