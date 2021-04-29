import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const DEBUG = process.env.DEBUG === 'true';

    const shareScreenButtonElement = await page.$('div[class^="actionButtons-"] > button:nth-child(2)');
    if (!shareScreenButtonElement) {
        throw new Error('The "Share Screen" button has not been found');
    }
    await shareScreenButtonElement.click();

    if (DEBUG) {
        console.log('Share screen button clicked');
        await page.screenshot({ path: 'logs/5-share-screen-button-clicked.jpg' });
    }

    state.screenShared = true;
};
