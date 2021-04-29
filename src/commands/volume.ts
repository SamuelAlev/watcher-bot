import { Page } from 'puppeteer';
import { State } from '..';
import setVideoVolume from '../functions/setVideoVolume';

export default async (page: Page, state: State, parameters: string[]) => {
    const volume = parseInt(parameters[0]);
    if (!volume) {
        throw new Error('No volume given');
    }
    await setVideoVolume(page, volume);
};
