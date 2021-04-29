import { Page } from 'puppeteer';
import { State } from '..';
import startVideo from '../functions/startVideo';

export default async (page: Page, state: State) => {
    await startVideo(page);
};
