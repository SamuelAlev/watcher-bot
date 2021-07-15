import { Page } from 'puppeteer';
import { State } from '..';

import bindAudioToScreenShareMediaStream from './bindAudioToScreenShareMediaStream';
import bindVideoToScreenShareMediaStream from './bindVideoToScreenShareMediaStream';
import connectToVoiceChannel from './connectToVoiceChannel';
import disconnectFromVoiceChannel from './disconnectFromVoiceChannel';
import setSrcOnAudioTag from './setSrcOnAudioTag';
import setSrcOnVideoTag from './setSrcOnVideoTag';
import setVideoLoop from './setVideoAndAudioTagsLoop';
import setVideoTypeOnVideoTag from './setVideoTypeOnVideoTag';
import startScreenSharing from './startScreenSharing';
import startVideo from './startVideoAndAudioTags';
import unbindAudioFromScreenShareMediaStream from './unbindAudioFromScreenShareMediaStream';
import unbindVideoFromScreenShareMediaStream from './unbindVideoFromScreenShareMediaStream';

import stop from '../commands/stop';
import { Database } from 'sqlite3';

export default async (page: Page, state: State, database: Database, videoLink: string, audioLink: string) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Playing the video and audio');

    try {
        // Reset attributes
        state.screenShared && (await disconnectFromVoiceChannel(page, state));
        await setVideoLoop(page, false);
        await unbindVideoFromScreenShareMediaStream(page, state);
        await unbindAudioFromScreenShareMediaStream(page, state);

        // Set type based on URL
        await setVideoTypeOnVideoTag(page, videoLink);

        // Setup Stream
        if (videoLink === audioLink) {
            await setSrcOnVideoTag(page, videoLink);
            await bindVideoToScreenShareMediaStream(page, state, true);
        } else {
            await setSrcOnVideoTag(page, videoLink);
            await setSrcOnAudioTag(page, audioLink);
            await bindVideoToScreenShareMediaStream(page, state);
            await bindAudioToScreenShareMediaStream(page, state);
        }

        // Connect to the voice channel and share the screen
        await connectToVoiceChannel(page, state);

        await page.waitForSelector('div[class^="actionButtons-"] > button:nth-child(2)');

        await startScreenSharing(page, state);

        // Play the video
        await startVideo(page);
    } catch (e) {
        await stop(page, state, database);
        console.error("Couldn't connect and stream", e);
    }
};
