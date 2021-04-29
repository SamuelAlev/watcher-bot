import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, loopState: boolean) => {
    await page.$eval(
        '#video-to-play',
        (video, loopState) => {
            (video as HTMLVideoElement).loop = loopState as boolean;
        },
        loopState,
    );
    await page.$eval(
        '#audio-to-play',
        (audio, loopState) => {
            (audio as HTMLVideoElement).loop = loopState as boolean;
        },
        loopState,
    );
};
