import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { PlayStatus, QueueItem, State } from '..';
import getQueuedItems from '../database/getQueuedItems';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';

const getItemRowMessage = (item: QueueItem, index: number): string => {
    return `#${index} - ${item.originalVideoLink} ${item.status === PlayStatus.Playing ? '(playing)' : ''}`;
};

const getQueueMessage = (items: QueueItem[]): string => {
    if (items.length) {
        return items.map((item, index) => getItemRowMessage(item, index + 1)).join('\n');
    }
    return 'The queue is empty';
};

export default async (_page: Page, _state: State, database: Database) => {
    try {
        const items = await getQueuedItems(database);
        await sendMessage({
            title: 'Queue',
            description: getQueueMessage(items),
        });
    } catch {
        return await sendMessage({
            title: 'Error',
            description: "Couldn't retreive the video(s) in the queue.",
            color: MessageEmbedColor.Error,
        });
    }
};
