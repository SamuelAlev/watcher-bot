import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State) => {
    const DEBUG = process.env.DEBUG === 'true';
    const VIDEO_FPS = parseInt(process.env.VIDEO_FPS);

    await page.evaluate(
        (VIDEO_FPS: number, DEBUG: boolean) => {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            if (!canvas) {
                throw new Error("Could't find the canvas tag");
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error("Could't get canvas context");
            }

            window.logger('video track on canvas tag:', canvas.captureStream(VIDEO_FPS).getVideoTracks());
            const videoTrack = canvas.captureStream(VIDEO_FPS).getVideoTracks()[0];
            if (videoTrack) {
                window.mixedStream.addTrack(videoTrack);
                DEBUG && window.logger('Video stream bound to `window.mixedStream`');
            } else {
                DEBUG && window.logger('No video stream on the video tag to add');
            }
        },
        VIDEO_FPS,
        DEBUG,
    );

    state.videoStreamBound = true;
};
