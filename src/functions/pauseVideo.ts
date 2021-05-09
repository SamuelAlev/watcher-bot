import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Pausing the video');

    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).pause();
    });

    await page.$eval(
        '#audio-to-play',
        (audio, DEBUG) => {
            const videoTag = document.getElementById('video-to-play') as HTMLVideoElement;
            if (videoTag) {
                (audio as HTMLAudioElement).pause();
                (audio as HTMLAudioElement).currentTime = videoTag.currentTime;
            } else {
                DEBUG && window.logger('No video tag found');
            }
        },
        DEBUG,
    );
};
