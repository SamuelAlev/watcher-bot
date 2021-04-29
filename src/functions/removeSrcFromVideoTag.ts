import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Removing `src` attribute to video tag');

    await page.evaluate(() => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            throw new Error("Could't find the video tag");
        }

        video.pause();
        video.removeAttribute('src');
        video.load();
    });
};
