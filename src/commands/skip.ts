import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { PlayStatus, State } from '..';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';
import playVideoOnScreenShareMediaStream from '../functions/playVideoOnScreenShareMediaStream';
import updateItemStatusById from '../database/updateItemStatusById';
import countItemInQueue from '../database/countItemInQueue';
import getFirstItemInQueue from '../database/getFirstItemInQueue';
import stop from '../commands/stop';

export default async (page: Page, state: State, database: Database) => {
    const DEBUG = process.env.DEBUG === 'true';

    if (!state.currentlyPlaying) {
        return await sendMessage({
            title: 'Error',
            description: 'No video is currently playing.',
            color: MessageEmbedColor.Error,
        });
    }

    await updateItemStatusById(database, PlayStatus.Played, state.currentlyPlaying.id);

    const count = await countItemInQueue(database);

    if (count) {
        DEBUG && console.log('Video ended, next video will arrive');

        const item = await getFirstItemInQueue(database);

        await sendMessage({
            title: 'Skipping',
            description: 'Skipped the video, the next video will be played.',
        });

        await updateItemStatusById(database, PlayStatus.Playing, item.id);
        state.currentlyPlaying = item;
        await playVideoOnScreenShareMediaStream(page, state, database, item.videoLink, item.audioLink, item.subtitleLink);
    } else {
        DEBUG && console.log('Video ended, leaving');

        await sendMessage({
            title: 'Skipping',
            description: 'No other video in the queue, leaving.',
        });

        await stop(page, state, database);
    }
};
