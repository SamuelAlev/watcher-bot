import { Page } from 'puppeteer';
import toggleVideoLoop from '../functions/toggleVideoTagLoop';

export default async (page: Page) => {
    await toggleVideoLoop(page);
};
