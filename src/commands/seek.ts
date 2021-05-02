import { Page } from 'puppeteer';
import { State } from '..';
import setVideoTime from '../functions/setVideoTagTime';

export default async (page: Page, _state: State, parameters: string[]) => {
    const time = parseInt(parameters[0]);
    if (!time) {
        throw new Error('No time given');
    }
    await setVideoTime(page, time);
};
