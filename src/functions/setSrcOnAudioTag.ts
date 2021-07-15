import { Page } from 'puppeteer';

export default async (page: Page, audioPath: string) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `src` attribute to audio tag');

    await page.evaluate(
        (DEBUG: boolean, audioPath: string) => {
            return new Promise<void>((resolve, reject) => {
                const audio = document.getElementById('audio-to-play');
                const source = audio?.querySelector('source');
                if (!audio || !source) {
                    return reject("Could't find the audio tag");
                }

                source.setAttribute('src', audioPath);

                (audio as HTMLAudioElement).load();

                (audio as HTMLAudioElement).addEventListener('loadeddata', () => {
                    DEBUG && console.log('Audio can play');
                    resolve();
                });

                (source as HTMLSourceElement).addEventListener('loadeddata', () => {
                    DEBUG && console.log('Audio Source can play');
                    resolve();
                });

                (audio as HTMLAudioElement).addEventListener('error', () => {
                    reject('Audio can not play');
                });

                (source as HTMLSourceElement).addEventListener('error', () => {
                    reject('Audio Source can not play');
                });
            });
        },
        DEBUG,
        audioPath,
    );
};
