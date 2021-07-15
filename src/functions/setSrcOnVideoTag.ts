import { Page } from 'puppeteer';

export default async (page: Page, videoPath: string) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `src` attribute to video tag');

    await page.evaluate(
        (DEBUG: boolean, videoPath: string) => {
            return new Promise<void>((resolve, reject) => {
                const video = document.getElementById('video-to-play') as HTMLVideoElement;
                const source = video?.querySelector('source');
                if (!video || !source) {
                    return reject("Could't find the video tag");
                }

                if (videoPath.includes('.m3u8') && window.Hls.isSupported()) {
                    DEBUG && console.log('Hls support the format');
                    const hls = new window.Hls();
                    hls.loadSource(videoPath);
                    hls.attachMedia(video);
                } else {
                    DEBUG && console.log('Hls does not support the format');
                    source.setAttribute('src', videoPath);
                }

                (video as HTMLVideoElement).load();

                (video as HTMLVideoElement).addEventListener('loadeddata', () => {
                    DEBUG && console.log('Video can play');
                    resolve();
                });

                (source as HTMLSourceElement).addEventListener('loadeddata', () => {
                    DEBUG && console.log('Video Source can play');
                    resolve();
                });

                (video as HTMLVideoElement).addEventListener('error', () => {
                    reject('Video can not play');
                });

                (source as HTMLSourceElement).addEventListener('error', () => {
                    reject('Video Source can not play');
                });
            });
        },
        DEBUG,
        videoPath,
    );
};
