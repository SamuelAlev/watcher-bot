import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { State } from '..';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';
import setVideoVolume from '../functions/setVideoAndAudioTagsVolume';

export default async (page: Page, _state: State, _database: Database, parameters: string[]) => {
    const volume = parseInt(parameters[0]);

    if (!volume) {
        return await sendMessage({
            title: 'Error',
            description: 'No volume was given with the command.',
            color: MessageEmbedColor.Error,
        });
    }
    await setVideoVolume(page, volume);
};
