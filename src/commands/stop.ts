import { Page } from 'puppeteer';
import { Database } from 'sqlite3';
import { PlayStatus, State } from '..';
import updateItemStatusById from '../database/updateItemStatusById';
import updateItemStatusWhereQueued from '../database/updateItemStatusWhereQueued';
import disconnectFromVoiceChannel from '../functions/disconnectFromVoiceChannel';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';
import unbindAudioFromScreenShareMediaStream from '../functions/unbindAudioFromScreenShareMediaStream';
import unbindVideoFromScreenShareMediaStream from '../functions/unbindVideoFromScreenShareMediaStream';

export default async (page: Page, state: State, database: Database) => {
    try {
        if (state.currentlyPlaying) {
            await updateItemStatusById(database, PlayStatus.Played, state.currentlyPlaying.id);
        }
        await updateItemStatusWhereQueued(database, PlayStatus.Played);
        await unbindVideoFromScreenShareMediaStream(page, state);
        await unbindAudioFromScreenShareMediaStream(page, state);
        state.connectedToVoiceChannel && (await disconnectFromVoiceChannel(page, state));

        state.currentlyPlaying = undefined;
        state.screenShared = false;
        state.audioStreamBound = false;
        state.videoStreamBound = false;
        state.connectedToVoiceChannel = false;
    } catch (e) {
        return await sendMessage({
            title: 'Error',
            description: "Couldn't disconnect from the server.",
            color: MessageEmbedColor.Error,
        });
    }
};
