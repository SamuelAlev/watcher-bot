import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const DEBUG = process.env.DEBUG === 'true';

    await page.evaluate((DEBUG: boolean) => {
        const videoTracks = window.mixedStream.getVideoTracks();
        if (videoTracks.length) {
            if (DEBUG) {
                window.logger(`Unbinding ${videoTracks.length} video streams from \`window.mixedStream\``);
            }
            videoTracks.forEach((videoTrack) => {
                window.mixedStream.removeTrack(videoTrack);
            });
        } else {
            if (DEBUG) {
                window.logger('No video stream to remove from `window.mixedStream`');
            }
        }
    }, DEBUG);

    state.videoStreamBound = false;
};
