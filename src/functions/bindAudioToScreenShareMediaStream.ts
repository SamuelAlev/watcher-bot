import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const DEBUG = process.env.DEBUG === 'true';
    const VIDEO_FPS = parseInt(process.env.VIDEO_FPS);

    await page.evaluate(
        (VIDEO_FPS: number, DEBUG: boolean) => {
            const audio = document.getElementById('audio-to-play') as HTMLVideoElement;
            if (!audio) {
                throw new Error("Could't find the audio tag");
            }

            const audioTrack = audio.captureStream(VIDEO_FPS).getAudioTracks()[0];
            if (audioTrack) {
                window.mixedStream.addTrack(audioTrack);
                DEBUG && window.logger('Audio stream bound to `window.mixedStream`');
            } else {
                DEBUG && window.logger('No audio stream on the audio tag to add');
            }
        },
        VIDEO_FPS,
        DEBUG,
    );

    state.audioStreamBound = true;
};
