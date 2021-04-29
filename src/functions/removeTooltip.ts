import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    const tooltip = await page.$('div[class*="channelNotice-"] > div[class*="close-"]');
    if (!tooltip) {
        DEBUG && console.log('No tooltip to hide');
        return;
    }
    DEBUG && console.log('Hiding tooltip');

    await tooltip.click();
};
