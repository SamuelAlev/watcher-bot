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

        let captionText: string | null = null;

        const drawStroked = (text: string, x: number, y: number) => {
            ctx.strokeStyle = 'black';
            ctx.textBaseline = 'top';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 8;

            ctx.strokeText(text, x, y);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillText(text, x, y);
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'white';
            ctx.fillText(text, x, y);
        };

        const drawPlayIcon = (ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = 'black';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 1;

            const size = (canvas.height / 2) * 0.5;
            const height = size;
            const width = size / 3;

            ctx.fillRect(canvas.width / 2 - width - width / 2, canvas.height / 2 - height / 2, width, height);
            ctx.fillRect(canvas.width / 2 + width / 2, canvas.height / 2 - height / 2, width, height);
        };

        const updateCanvas = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, options: { scale: number }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const vidH = video.videoHeight;
            const vidW = video.videoWidth;
            const top = canvas.height / 2 - (vidH / 2) * options.scale;
            const left = canvas.width / 2 - (vidW / 2) * options.scale;
            ctx.drawImage(video, left, top, vidW * options.scale, vidH * options.scale);

            if (captionText) {
                ctx.font = '48px Sans-serif';

                const captionTexts = captionText
                    .replaceAll('<b>', '')
                    .replaceAll('</b>', '')
                    .replaceAll('<i>', '')
                    .replaceAll('</i>', '')
                    .split('\n');

                captionTexts.forEach((text, index) => {
                    const textWidth = ctx.measureText(text).width;
                    drawStroked(
                        text,
                        (video.videoWidth / 2 - textWidth / 2) * options.scale,
                        vidH * options.scale - 80 - (captionTexts.length - index - 1) * 55,
                    );
                });
            }

            if (video.paused) {
                drawPlayIcon(ctx);
            }

            requestAnimationFrame(() => updateCanvas(ctx, video, options));
        };

        video.addEventListener('canplay', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
            window.logger(scale);
            requestAnimationFrame(() => updateCanvas(ctx, video, { scale }));
        });

        video.textTracks[0].addEventListener('cuechange', (event: Event) => {
            captionText = (((event.target as TextTrack).activeCues as TextTrackCueList)[0] as VTTCue).text;
        });
    });
};
