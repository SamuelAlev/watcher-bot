import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, 'div[class*="layerContainer-"]');

    await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, 'div[class*="channelNotice-"]');

    await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, 'div[id*="popup"]');

    await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, 'div[class*="popup"]');
};
