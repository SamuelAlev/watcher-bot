import { Page } from 'puppeteer';

export default async (page: Page, time: number) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).currentTime = time;
    });
};
