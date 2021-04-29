import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Bind queue to video tag');

    await page.evaluate(() => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            throw new Error("Could't find the video tag");
        }

        video.onended = () => {
            if (!video.loop) {
                window.onVideoEnded();
            }
        };
    });
};
