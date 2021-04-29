import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Disconnect from voice channel');

    const disconnectButton = await page.$('div[class*="connection-"] > div:last-child > button');
    if (!disconnectButton) {
        throw new Error("Can't disconnect from the server");
    }

    state.connectedToVoiceChannel = false;

    await disconnectButton.click();

    state.screenShared = false;
    state.connectedToVoiceChannel = false;
};
