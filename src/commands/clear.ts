import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { PlayStatus, State } from '..';
import updateItemStatusWhereQueued from '../database/updateItemStatusWhereQueued';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';

export default async (_page: Page, _state: State, _parameters: string[], database: Database) => {
    try {
        await updateItemStatusWhereQueued(database, PlayStatus.Played);
        await sendMessage({
            title: 'Queue',
            description: 'The queue has been cleared.',
        });
    } catch {
        return await sendMessage({
            title: 'Error',
            description: "Couldn't clear the queue.",
            color: MessageEmbedColor.Error,
        });
    }
};
