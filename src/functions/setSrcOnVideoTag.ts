import { Page } from 'puppeteer';

export default async (page: Page, videoPath: string) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `src` attribute to video tag');

    await page.evaluate((videoPath: string) => {
        return new Promise<void>((resolve, reject) => {
            const video = document.getElementById('video-to-play');
            if (!video) {
                return reject("Could't find the video tag");
            }

            video.setAttribute('src', videoPath);

            video.oncanplay = () => resolve();
        });
    }, videoPath);
};
