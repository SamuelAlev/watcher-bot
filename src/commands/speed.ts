import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { State } from '..';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';
import setVideoSpeed from '../functions/setVideoSpeed';

export default async (page: Page, _state: State, _database: Database, parameters: string[]) => {
    const speed = parseInt(parameters[0]);

    if (!speed) {
        return await sendMessage({
            title: 'Error',
            description: 'No speed was given with the command.',
            color: MessageEmbedColor.Error,
        });
    }
    await setVideoSpeed(page, speed);
};
