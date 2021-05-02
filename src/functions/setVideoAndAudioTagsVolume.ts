import { Page } from 'puppeteer';

export default async (page: Page, volume: number) => {
    const DEBUG = process.env.DEBUG === 'true';

    await page.evaluate(() => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            if (DEBUG as boolean) {
                window.logger('No video tag found');
            }
        }

        const audio = document.getElementById('audio-to-play') as HTMLVideoElement;
        if (!audio) {
            if (DEBUG as boolean) {
                window.logger('No audio tag found');
            }
        }

        video.volume = volume / 100;
        audio.volume = volume / 100;
    }, DEBUG);
};
