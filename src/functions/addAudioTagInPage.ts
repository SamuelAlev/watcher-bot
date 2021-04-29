import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `audio` tag to the page');

    await page.evaluate(() => {
        return new Promise<void>((resolve, reject) => {
            const audio = document.createElement('audio');

            audio.setAttribute('id', 'audio-to-play');
            audio.setAttribute('crossorigin', 'anonymous');
            audio.setAttribute('controls', '');

            audio.onerror = () => reject('Error while adding the audio');

            (document as HTMLDocument).body.appendChild(audio);

            return resolve();
        });
    });
};
