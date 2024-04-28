import * as path from 'path';

export const getSuiteImageDirectories = (suiteSlug: string, suitesDirectory: string) => {
    const snapsDir = path.join(suitesDirectory, suiteSlug, 'snapshots', 'snaps');
    const diffDir = path.join(snapsDir, '__diff_output__');
    const receivedDir = path.join(snapsDir, '__received_output__');

    const imageDirectories = {
        baselines: snapsDir,
        diffs: diffDir,
        receivedImages: receivedDir
    };

    return imageDirectories;
}

