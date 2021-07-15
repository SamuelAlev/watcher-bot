import { Page } from 'puppeteer';
import { State } from '..';

export default async (page: Page, state: State, withVideoTagAudio = false) => {
    const DEBUG = process.env.DEBUG === 'true';
    const VIDEO_FPS = parseInt(process.env.VIDEO_FPS);

    await page.evaluate(
        (VIDEO_FPS: number, DEBUG: boolean, withVideoTagAudio: boolean) => {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            if (!canvas) {
                throw new Error("Could't find the canvas tag");
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error("Could't get canvas context");
            }

            DEBUG && window.logger('video track on canvas tag:', canvas.captureStream(VIDEO_FPS).getVideoTracks());
            const videoTrack = canvas.captureStream(VIDEO_FPS).getVideoTracks()[0];
            if (videoTrack) {
                window.mixedStream.addTrack(videoTrack);
                DEBUG && window.logger('Video stream bound to `window.mixedStream`');
            } else {
                DEBUG && window.logger('No video stream on the video tag to add');
            }

            if (withVideoTagAudio) {
                const video = document.getElementById('video-to-play') as HTMLVideoElement;
                if (!video) {
                    throw new Error("Could't find the video tag");
                }
                const audioTrack = video.captureStream(VIDEO_FPS).getAudioTracks()[0];
                if (audioTrack) {
                    window.mixedStream.addTrack(audioTrack);
                    DEBUG && window.logger('Audio stream bound to `window.mixedStream`');
                } else {
                    DEBUG && window.logger('No audio stream on the video tag to add');
                }
            }
        },
        VIDEO_FPS,
        DEBUG,
        withVideoTagAudio,
    );

    state.videoStreamBound = true;
};
