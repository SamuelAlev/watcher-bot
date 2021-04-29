import { Page } from 'puppeteer';

export default async (page: Page, speed: number) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).playbackRate = speed;
    });
};
