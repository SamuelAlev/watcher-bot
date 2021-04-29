import { Page } from 'puppeteer';

export default async (page: Page, volume: number) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).volume = volume / 100;
    });
};
