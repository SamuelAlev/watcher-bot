import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    await page.evaluate((DEBUG: boolean) => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            DEBUG && window.logger('No video tag found');
        }

        const audio = document.getElementById('audio-to-play') as HTMLVideoElement;
        if (!audio) {
            DEBUG && window.logger('No audio tag found');
        }

        if (window.mixedStream.getVideoTracks().length) {
            (video as HTMLVideoElement).play();
            DEBUG && window.logger('Starting the video');
        }

        if (window.mixedStream.getAudioTracks().length) {
            (audio as HTMLAudioElement).currentTime = video.currentTime;
            (audio as HTMLAudioElement).play();
            DEBUG && window.logger('Starting the audio');
        }
    }, DEBUG);
};
