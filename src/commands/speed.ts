import { Page } from 'puppeteer';
import { State } from '..';
import setVideoSpeed from '../functions/setVideoSpeed';

export default async (page: Page, state: State, parameters: string[]) => {
    const speed = parseInt(parameters[0]);
    if (!speed) {
        throw new Error('No speed given');
    }
    await setVideoSpeed(page, speed);
};
