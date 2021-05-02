import { Page } from 'puppeteer';
import pauseVideo from '../functions/pauseVideo';

export default async (page: Page) => {
    await pauseVideo(page);
};
