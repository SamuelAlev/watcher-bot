import { Page } from 'puppeteer';
import { State } from '..';
import toggleVideoLoop from '../functions/toggleVideoLoop';

export default async (page: Page, state: State) => {
    await toggleVideoLoop(page);
};
