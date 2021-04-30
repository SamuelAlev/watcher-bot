import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const { DISCORD_VOICE_CHANNEL_ID } = process.env;
    console.log(`a[data-list-item-id="channels___${DISCORD_VOICE_CHANNEL_ID}"]`);

    const DEBUG = process.env.DEBUG === 'true';

    if (DEBUG) {
        console.log('Connect from voice channel');
        await page.screenshot({ path: 'logs/3-show-server.jpg' });
    }

    const voiceChannelElement = await page.$(`a[data-list-item-id="channels___${DISCORD_VOICE_CHANNEL_ID}"]`);

    if (!voiceChannelElement) {
        throw new Error("Haven't found the channel by ID");
    }
    await voiceChannelElement.click();

    state.connectedToVoiceChannel = true;

    if (DEBUG) {
        console.log('Voice channel clicked');
        await page.screenshot({ path: 'logs/4-voice-channel-clicked.jpg' });
    }
};
