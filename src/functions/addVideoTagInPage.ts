import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `video` tag to the page');

    await page.evaluate(() => {
        return new Promise<void>((resolve, reject) => {
            const video = document.createElement('video');
            video.setAttribute('id', 'video-to-play');
            video.setAttribute('muted', '');
            video.setAttribute('crossorigin', 'anonymous');
            video.setAttribute('controls', '');

            const source = document.createElement('source');
            video.appendChild(source);

            const track = document.createElement('track');
            track.setAttribute('default', 'default');
            track.setAttribute('kind', 'captions');
            track.setAttribute('srclang', 'en');
            video.appendChild(track);

            video.onerror = () => reject('Error while adding the video tag.');
            source.onerror = () => reject('Error while adding the source in video tag.');
            track.onerror = () => reject('Error while adding the track in video tag.');

            document.body.appendChild(video);

            return resolve();
        });
    });
};
