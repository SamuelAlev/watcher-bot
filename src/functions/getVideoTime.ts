import { Page } from 'puppeteer';

export default async (page: Page): Promise<number> => {
    const DEBUG = process.env.DEBUG === 'true';

    const currentTime = await page.$eval<number>(
        '#video-to-play',
        (video): number => (video as HTMLVideoElement).currentTime,
    );

    DEBUG && console.log('Current time:', currentTime);

    return currentTime;
};
