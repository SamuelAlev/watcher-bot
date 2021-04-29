import { Page } from 'puppeteer';

export default async (page: Page) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Bind `video` tag to `canvas` tag');

    await page.evaluate(() => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            throw new Error("Could't find the video tag");
        }

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Could't find the canvas tag");
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Could't get canvas context");
        }

        video.onplay = () => {
            const frame = () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        };
    });
};
