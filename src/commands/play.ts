import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { PlayStatus, QueueItem, State } from '..';
import countItemInQueue from '../database/countItemInQueue';
import getFirstItemInQueue from '../database/getFirstItemInQueue';
import insertItemInQueue from '../database/insertItemInQueue';
import updateItemStatusById from '../database/updateItemStatusById';
import getVideoAndAudioFromUrl from '../functions/getVideoAndAudioFromUrl';
import playVideoOnScreenShareMediaStream from '../functions/playVideoOnScreenShareMediaStream';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';
import supportedVideoSources from '../supportedVideoSources.json';

const getAddedToTheQueueMessage = (count: number, item: QueueItem): string => {
    if (count) {
        let message = `${item.originalVideoLink} has been added to the queue, `;
        message += `there ${count > 1 ? `are ${count} videos` : `is 1 video`} before.`;

        return message;
    }

    return `${item.originalVideoLink} has been added to the queue, the bot will arrive soon.`;
};

export default async (page: Page, state: State, database: Database, parameters: string[]) => {
    if (!parameters.length) {
        return await sendMessage({
            title: 'Error',
            description: 'No link given',
            color: MessageEmbedColor.Error,
        });
    }

    const originalLink = parameters[0].replace(/^"|"$/g, '');

    let videoLink = originalLink;
    let audioLink = videoLink;

    if (
        supportedVideoSources['youtube-dl'].some((host) => {
            return originalLink.includes(host);
        })
    ) {
        try {
            const videoSources = await getVideoAndAudioFromUrl(originalLink);

            videoLink = videoSources.videoLink;
            audioLink = videoSources.audioLink;
        } catch {
            return await sendMessage({
                title: 'Error',
                description: "Couldn't get the video from the link.",
                color: MessageEmbedColor.Error,
            });
        }
    }

    // Add to the queue
    try {
        const count = await countItemInQueue(database);

        const item = {
            id: 0,
            originalVideoLink: originalLink,
            videoLink: videoLink,
            audioLink: audioLink,
            status: PlayStatus.Queued,
            createdAt: new Date().toISOString(),
        };

        await insertItemInQueue(database, item);

        await sendMessage({
            title: 'Video added to the queue',
            description: getAddedToTheQueueMessage(count, item),
        });
    } catch {
        return await sendMessage({
            title: 'Error',
            description: "Couldn't add the video to the queue.",
            color: MessageEmbedColor.Error,
        });
    }

    if (!state.currentlyPlaying) {
        const item = await getFirstItemInQueue(database);
        state.currentlyPlaying = item;
        await updateItemStatusById(database, PlayStatus.Playing, item.id);
        await playVideoOnScreenShareMediaStream(page, state, database, item.videoLink, item.audioLink);
    }
};
