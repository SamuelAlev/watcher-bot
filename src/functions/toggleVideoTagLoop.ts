import { Page } from 'puppeteer';

export default async (page: Page) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).loop = !(video as HTMLVideoElement).loop;
    });
};
