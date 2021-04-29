import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Removing `src` attribute to audio tag');

    await page.evaluate(() => {
        const audio = document.getElementById('audio-to-play') as HTMLVideoElement;
        if (!audio) {
            throw new Error("Could't find the audio tag");
        }

        audio.pause();
        audio.removeAttribute('src');
        audio.load()
    });
};
