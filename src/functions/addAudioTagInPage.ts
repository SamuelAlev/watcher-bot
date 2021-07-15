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
            audio.setAttribute('style', 'visibility: hidden;');

            const source = document.createElement('source');

            audio.appendChild(source);

            audio.onerror = () => reject('Error while adding the audio tag.');
            source.onerror = () => reject('Error while adding the source in audio tag.');

            (document as HTMLDocument).body.appendChild(audio);

            return resolve();
        });
    });
};
