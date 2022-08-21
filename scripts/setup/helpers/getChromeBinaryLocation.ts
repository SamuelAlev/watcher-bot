import { stat } from 'node:fs';
import { exec, ExecException } from 'node:child_process';

export const getChromeBinaryLocation = async () => {
    let path: string | null = null;

    if (process.platform === 'darwin') {
        //TODO: get chrome path from macOS
        //path = await getOSXPath(finisher);
    } else if (process.platform === 'win32') {
        path = await getWinPath();
    } else {
        path = await getLinuxPath();
    }

    return path;
};

const getWinPath = async () => {
    const winSuffix = '\\Google\\Chrome\\Application\\chrome.exe';
    const prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];

    const chromePath = await Promise.any([
        tryLocation(prefixes[0] + winSuffix),
        tryLocation(prefixes[1] + winSuffix),
        tryLocation(prefixes[2] + winSuffix),
    ]);

    return chromePath;
};

const getLinuxPath = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec('which google-chrome', (error: ExecException | null, response: string) => {
            if (error) {
                reject();
            } else {
                resolve(response.trim());
            }
        });
    });
};

const tryLocation = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        stat(path, (error) => {
            if (error) {
                reject();
            } else {
                resolve(path);
            }
        });
    });
};
