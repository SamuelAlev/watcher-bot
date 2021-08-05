import { Page } from 'puppeteer';

export default async (page: Page, videoPath: string, subtitlePath: string | null) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Adding `src` attribute to video tag');

    await page.evaluate(
        (DEBUG: boolean, videoPath: string, subtitlePath: string | null) => {
            return new Promise<void>((resolve, reject) => {
                const video = document.getElementById('video-to-play') as HTMLVideoElement;
                const source = video?.querySelector('source');
                const track = video?.querySelector('track');
                if (!video || !source || !track) {
                    return reject("Could't find the video tag");
                }

                if (!window.hlsInstance) {
                    window.hlsInstance = new window.Hls();
                }
                window.hlsInstance.detachMedia(video);

                if (videoPath.includes('.m3u8')) {
                    DEBUG && console.log('Hls support the format');
                    window.hlsInstance.loadSource(videoPath);
                    window.hlsInstance.attachMedia(video);
                    window.hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                } else {
                    DEBUG && console.log('Hls does not support the format');
                    subtitlePath && track.setAttribute('src', subtitlePath);
                    source.setAttribute('src', videoPath);
                    (video as HTMLVideoElement).load();
                }

                (video as HTMLVideoElement).addEventListener('loadeddata', () => {
                    DEBUG && console.log('Video can play');
                    resolve();
                });

                (source as HTMLSourceElement).addEventListener('loadeddata', () => {
                    DEBUG && console.log('Video Source can play');
                    resolve();
                });

                (track as HTMLTrackElement).addEventListener('loadeddata', () => {
                    DEBUG && console.log('Video Track can play');
                    resolve();
                });

                (video as HTMLVideoElement).addEventListener('error', () => {
                    reject('Video can not play');
                });

                (source as HTMLSourceElement).addEventListener('error', () => {
                    reject('Video Source can not play');
                });

                (track as HTMLTrackElement).addEventListener('error', () => {
                    reject('Video Track can not play');
                });
            });
        },
        DEBUG,
        videoPath,
        subtitlePath,
    );
};
