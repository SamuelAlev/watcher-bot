import { Page } from 'puppeteer';
import { State } from '..';
import disconnectFromVoiceChannel from '../functions/disconnectFromVoiceChannel';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';
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
        return await sendMessage({
            title: 'Error',
            description: "Couldn' disconnect from the server.",
            color: MessageEmbedColor.Error,
        });
    }
};
