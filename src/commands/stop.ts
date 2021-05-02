import { Page } from 'puppeteer';
import { State } from '..';
import disconnectFromVoiceChannel from '../functions/disconnectFromVoiceChannel';
import unbindAudioFromScreenShareMediaStream from '../functions/unbindAudioFromScreenShareMediaStream';
import unbindVideoFromScreenShareMediaStream from '../functions/unbindVideoFromScreenShareMediaStream';

export default async (page: Page, state: State) => {
    try {
        await unbindVideoFromScreenShareMediaStream(page, state);
        await unbindAudioFromScreenShareMediaStream(page, state);
        await disconnectFromVoiceChannel(page);

        state.currentlyPlaying = undefined;
        state.screenShared = false;
        state.audioStreamBound = false;
        state.videoStreamBound = false;
        state.connectedToVoiceChannel = false;
    } catch (e) {
        console.error("Couldn't disconnect from the stream:", e);
    }
};
