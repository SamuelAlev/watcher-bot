import { Page } from 'puppeteer';

export default async (page: Page, loopState: boolean) => {
    const DEBUG = process.env.DEBUG === 'true';

    await page.evaluate(
        (DEBUG: boolean, loopState: boolean) => {
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

            window.logger('loopState', loopState);

            video.loop = loopState;
            audio.loop = loopState;
        },
        DEBUG,
        loopState,
    );
};
