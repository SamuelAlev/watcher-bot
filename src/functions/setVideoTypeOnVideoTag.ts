import { Page } from 'puppeteer';

export default async (page: Page, videoLink: string) => {
    await page.evaluate(async (videoLink: string) => {
        const source = document.querySelector('#video-to-play > source') as HTMLSourceElement;
        const videoUrlSplit = videoLink.split('.');
        const videoUrlExtension = videoUrlSplit[videoUrlSplit.length - 1] || '';

        const extensionToType = {
            avi: 'video/x-msvideo',
            m3u8: 'application/x-mpegURL',
            mkv: 'video/x-matroska',
            mp4: 'video/mp4',
            webm: 'video/webm',
        };

        if (videoUrlExtension in extensionToType) {
            //@ts-ignore
            source.type = extensionToType[videoUrlExtension];
            return;
        }

        const requestOnVideoUrl = await fetch(videoLink);
        const videoUrlContentType = requestOnVideoUrl.headers.get('Content-Type');

        if (videoUrlContentType) {
            source.type = videoUrlContentType;
        }
    }, videoLink);
};
