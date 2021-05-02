import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import youtubedl from 'youtube-dl-exec';
import { PlayStatus, State } from '..';
import countItemInQueue from '../database/countItemInQueue';
import getFirstItemInQueue from '../database/getFirstItemInQueue';
import insertItemInQueue from '../database/insertItemInQueue';
import playVideoOnScreenShareMediaStream from '../functions/playVideoOnScreenShareMediaStream';
import sendMessage from '../functions/sendMessage';

export default async (page: Page, state: State, parameters: string[], database: Database) => {
    const DEBUG = process.env.DEBUG === 'true';

    if (!parameters[0]) {
        await sendMessage({
            title: 'Error while adding video',
            description: 'No link given',
        });
    }

    const originalLink = parameters[0].replace(/^"|"$/g, '');

    let videoLink = originalLink;
    let audioLink = videoLink;

    // Is youtube
    if (videoLink.includes('youtube') || videoLink.includes('youtu.be')) {
        DEBUG && console.log('Getting the video and audio from youtube');

        try {
            const content = await youtubedl(videoLink, {
                getUrl: true,
                format: 'bestvideo,bestaudio',
            });

            //@ts-ignore
            const contentArray = content.split('\n');

            videoLink = contentArray[0];
            audioLink = contentArray[1];
        } catch {
            throw new Error('Unable to get the video from YouTube');
        }
    }

    if (videoLink.includes('pornhub') || videoLink.includes('clips.twitch.tv')) {
        DEBUG && console.log('Getting the video and audio');

        try {
            const content = await youtubedl(videoLink, {
                getUrl: true,
            });

            //@ts-ignore
            videoLink = content;
            //@ts-ignore
            audioLink = content;
        } catch {
            throw new Error('Unable to get the video');
        }
    }

    // Add to the queue
    try {
        const count = await countItemInQueue(database);

        await insertItemInQueue(database, {
            id: 0,
            originalVideoLink: originalLink,
            videoLink: videoLink,
            audioLink: audioLink,
            status: PlayStatus.Queued,
            createdAt: new Date().toISOString(),
        });

        await sendMessage({
            title: 'Video added to the queue',
            description: `${originalLink} has been added to the queue, ${
                count === 0
                    ? 'the bot will arrive soon'
                    : `there ${count > 1 ? `are ${count} videos` : `is 1 video`} before`
            }.`,
        });
    } catch {
        console.error("Couldn't add the video to the queue");
    }

    if (!state.currentlyPlaying) {
        const item = await getFirstItemInQueue(database);
        state.currentlyPlaying = item;
        await playVideoOnScreenShareMediaStream(page, state, item.videoLink, item.audioLink);
    }
};
