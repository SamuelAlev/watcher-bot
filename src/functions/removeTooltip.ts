import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    const firstTooltip = await page.$('div[class*="channelNotice-"] > div[class*="close-"]');
    if (!firstTooltip) {
        DEBUG && console.log('No first tooltip to hide');
    }

    const secondTooltip = await page.$('#popout_9 button');
    if (!secondTooltip) {
        DEBUG && console.log('No second tooltip to hide');
    }

    DEBUG && console.log('Hiding tooltip');

    await firstTooltip?.click();
    await secondTooltip?.click();
};
