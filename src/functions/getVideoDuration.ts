import { Page } from 'puppeteer';

export default async (page: Page): Promise<number> => {
    const DEBUG = process.env.DEBUG === 'true';

    const duration = await page.$eval<number>(
        '#video-to-play',
        (video): number => (video as HTMLVideoElement).duration,
    );

    DEBUG && console.log('Duration', duration);

    return duration;
};
