import { Page } from 'puppeteer';

export default async (page: Page, audioPath: string) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `src` attribute to audio tag');

    await page.evaluate((audioPath: string) => {
        return new Promise<void>((resolve, reject) => {
            const audio = document.getElementById('audio-to-play');
            if (!audio) {
                return reject("Could't find the audio tag");
            }

            audio.setAttribute('src', audioPath);

            audio.oncanplay = () => resolve();
        });
    }, audioPath);
};
