import { Page } from 'puppeteer';

export default async (page: Page): Promise<number> => {
    const duration = await page.$eval<number>(
        '#video-to-play',
        (video): number => (video as HTMLVideoElement).duration,
    );

    console.log('Duration', duration);

    return duration;
};
