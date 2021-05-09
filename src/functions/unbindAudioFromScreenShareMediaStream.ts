import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const DEBUG = process.env.DEBUG === 'true';

    await page.evaluate((DEBUG: boolean) => {
        const audioTracks = window.mixedStream.getAudioTracks();
        if (audioTracks.length) {
            DEBUG && window.logger(`Unbinding ${audioTracks.length} audio streams from \`window.mixedStream\``);
            audioTracks.forEach((audioTrack) => {
                window.mixedStream.removeTrack(audioTrack);
            });
        } else {
            DEBUG && window.logger('No audio stream to remove from `window.mixedStream`');
        }
    }, DEBUG);

    state.audioStreamBound = false;
};
