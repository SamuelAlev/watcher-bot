import { mkdirSync, existsSync } from 'fs';

export default (path: string): boolean => {
    if (!existsSync(path)) {
        mkdirSync(path);
        return true;
    }
    return false;
};
