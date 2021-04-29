import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const shareScreenButtonElement = await page.$('div[class^="actionButtons-"] > button:nth-child(2)');
    if (!shareScreenButtonElement) {
        throw new Error('The "Share Screen" button has not been found');
    }
    await shareScreenButtonElement.click();

    const stopScreenSharingElement = await page.$('#manage-streams-stop-streaming');
    if (!stopScreenSharingElement) {
        throw new Error('The "Stop Share Screen" button has not been found');
    }
    await stopScreenSharingElement.click();

    state.screenShared = false;
};
