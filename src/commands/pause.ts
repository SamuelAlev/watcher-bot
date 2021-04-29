import { Page } from 'puppeteer';
import { State } from '..';
import pauseVideo from '../functions/pauseVideo';

export default async (page: Page, state: State) => {
    await pauseVideo(page);
};
