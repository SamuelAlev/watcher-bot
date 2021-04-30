import { Page } from 'puppeteer';
import youtubedl from 'youtube-dl-exec';
import { State } from '..';
import bindAudioToScreenShareMediaStream from '../functions/bindAudioToScreenShareMediaStream';
import bindVideoToScreenShareMediaStream from '../functions/bindVideoToScreenShareMediaStream';
import connectToVoiceChannel from '../functions/connectToVoiceChannel';
import disconnectFromVoiceChannel from '../functions/disconnectFromVoiceChannel';
import setSrcOnAudioTag from '../functions/setSrcOnAudioTag';
import setSrcOnVideoTag from '../functions/setSrcOnVideoTag';
import setVideoLoop from '../functions/setVideoLoop';
import startScreenSharing from '../functions/startScreenSharing';
import startVideo from '../functions/startVideo';
import stopScreenSharing from '../functions/stopScreenSharing';
import unbindAudioFromScreenShareMediaStream from '../functions/unbindAudioFromScreenShareMediaStream';
import unbindVideoFromScreenShareMediaStream from '../functions/unbindVideoFromScreenShareMediaStream';

export default async (page: Page, state: State, parameters: string[]) => {
    if (!parameters[0]) {
        throw new Error('No link given');
    }

    let videoPath = parameters[0].replace(/^"|"$/g, '');
    let audioPath = videoPath;

    console.log([videoPath, audioPath]);

    // Is youtube
    if (videoPath.match(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/)) {
        console.log('YOUTUBE');

        const content = await youtubedl(videoPath, {
            getUrl: true,
            format: 'bestvideo,bestaudio',
        });

        //@ts-ignore
        const contentArray = content.split('\n');

        videoPath = contentArray[0];
        audioPath = contentArray[1];
    }

    try {
        // Reset attributes
        state.screenShared && (await disconnectFromVoiceChannel(page, state));
        await setVideoLoop(page, false);
        await unbindVideoFromScreenShareMediaStream(page, state);
        await unbindAudioFromScreenShareMediaStream(page, state);

        // Set video src
        await setSrcOnVideoTag(page, videoPath);
        await setSrcOnAudioTag(page, audioPath);

        // Setup Stream
        await bindVideoToScreenShareMediaStream(page, state);
        await bindAudioToScreenShareMediaStream(page, state);

        // Connect to the voice channel and share the screen
        if (!state.connectedToVoiceChannel) {
            await connectToVoiceChannel(page, state);
        }
        if (!state.screenShared) {
            await startScreenSharing(page, state);
        }

        // Play the video
        await startVideo(page);
    } catch (e) {
        await stopScreenSharing(page, state);
        console.error("Couldn't connect and stream", e);
    }
};
