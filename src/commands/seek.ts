import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { State } from '..';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';
import setVideoTime from '../functions/setVideoTagTime';

export default async (page: Page, _state: State, _database: Database, parameters: string[]) => {
    const time = parseInt(parameters[0]);

    if (!time) {
        return await sendMessage({
            title: 'Error',
            description: 'No time was given with the command.',
            color: MessageEmbedColor.Error,
        });
    }
    await setVideoTime(page, time);
};
