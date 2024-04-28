import * as path from 'path';
import { Endpoint } from '../../types';
import { getFileNameWithoutExtension, getFileType, getFileInfo, pathExists, getHumanReadableFileSize } from '../../utils';
import { serverPort } from '../config';
import { fetchSuiteConfig } from './fetch-suite-config';

export const getImage = async (suiteSlug: string, fileName: string, suitesDirectory: string) => {
    const suiteImagesDir = path.join(suitesDirectory, suiteSlug, 'snapshots/snaps');

    const cleanName = getFileNameWithoutExtension(fileName);

    const baselinePath = path.join(suiteImagesDir, cleanName + '.base.png');
    const receivedPath = path.join(suiteImagesDir, '__received_output__', cleanName + '-received.png');
    const diffPath = path.join(suiteImagesDir, '__diff_output__', cleanName + '.diff.png');

    const type = getFileType(fileName);
    let filePath = '';

    if (type === 'diff') {
        filePath = diffPath;
    } else if (type === 'received') {
        filePath = receivedPath;
    } else {
        filePath = baselinePath;
    }

    const { createdAt, modifiedAt } = getFileInfo(filePath);

    const siblingPaths = [];

    if (pathExists(baselinePath)) {
        siblingPaths.push({
            type: 'baseline',
            previewUrl: `/suite/${suiteSlug}/images/baseline/${cleanName}.base.png`
        });
    }

    if (pathExists(diffPath)) {
        siblingPaths.push({
            type: 'diff',
            previewUrl: `/suite/${suiteSlug}/images/diff/${cleanName}.diff.png`
        });
    }

    if (pathExists(receivedPath)) {
        siblingPaths.push({
            type: 'received',
            previewUrl: `/suite/${suiteSlug}/images/received/${cleanName}-received.png`
        });
    }

    const suiteConfig = await fetchSuiteConfig(suiteSlug);
    const endpoint = suiteConfig?.endpoints.find((endpoint: Endpoint) => {
        return endpoint.title === cleanName.slice(0, cleanName.indexOf(' @'));
    });

    const fullUrl = (suiteConfig?.baseUrl || '') + (endpoint?.path || '');

    const image = {
        suiteName: suiteSlug,
        name: cleanName,
        fileName: fileName,
        createdAt,
        modifiedAt,
        type,
        sizeString: getHumanReadableFileSize(filePath),
        fileUrl: `http://localhost:${serverPort}/images/${suiteSlug}/${type}/${fileName}`,
        path: filePath,
        siblingPaths,
        endpoint,
        baseUrl: suiteConfig?.baseUrl,
        fullUrl,
    };

    return image;
};
