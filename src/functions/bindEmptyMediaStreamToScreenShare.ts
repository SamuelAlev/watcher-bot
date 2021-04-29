import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    if (DEBUG) {
        console.log('Binding empty `MediaStream` to `getDisplayMedia`');
    }

    await page.evaluate(() => {
        window.mixedStream = new MediaStream([]);
        (navigator as Navigator).mediaDevices.getDisplayMedia = () => Promise.resolve(window.mixedStream);
    });
};
