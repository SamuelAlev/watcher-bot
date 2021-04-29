import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `canvas` tag to the page');

    await page.evaluate(() => {
        return new Promise<void>((resolve, reject) => {
            const canvas = document.createElement('canvas');

            canvas.setAttribute('id', 'canvas');

            canvas.onerror = () => reject('Error while adding the video');

            (document as HTMLDocument).body.appendChild(canvas);

            return resolve();
        });
    });
};
