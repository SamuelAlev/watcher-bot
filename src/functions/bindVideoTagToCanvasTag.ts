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

        const drawPlayIcon = (ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = 'black';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#DDD';
            ctx.globalAlpha = 0.75;
            ctx.beginPath();
            const size = (canvas.height / 2) * 0.5;
            ctx.moveTo(canvas.width / 2 + size / 2, canvas.height / 2);
            ctx.lineTo(canvas.width / 2 - size / 2, canvas.height / 2 + size);
            ctx.lineTo(canvas.width / 2 - size / 2, canvas.height / 2 - size);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        };

        const updateCanvas = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, options: { scale: number }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (video !== undefined) {
                const vidH = video.videoHeight;
                const vidW = video.videoWidth;
                const top = canvas.height / 2 - (vidH / 2) * options.scale;
                const left = canvas.width / 2 - (vidW / 2) * options.scale;
                ctx.drawImage(video, left, top, vidW * options.scale, vidH * options.scale);

                if (video.paused) {
                    drawPlayIcon(ctx);
                }
            }

            requestAnimationFrame(() => updateCanvas(ctx, video, options));
        };

        video.addEventListener('canplay', () => {
            const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
            requestAnimationFrame(() => updateCanvas(ctx, video, { scale }));
        });
    });
};
