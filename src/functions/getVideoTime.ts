import { Page } from 'puppeteer';

export default async (page: Page): Promise<number> => {
    const currentTime = await page.$eval<number>(
        '#video-to-play',
        (video): number => (video as HTMLVideoElement).currentTime,
    );

    console.log('Current time:', currentTime);

    return currentTime;
};
