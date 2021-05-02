import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Disconnect from voice channel');

    const disconnectButton = await page.$('div[class*="connection-"] > div:last-child > button');
    if (!disconnectButton) {
        throw new Error("Can't disconnect from the server");
    }

    await disconnectButton.click();
};
