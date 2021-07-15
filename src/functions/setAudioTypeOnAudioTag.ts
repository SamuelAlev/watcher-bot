import { Page } from 'puppeteer';

export default async (page: Page, audioLink: string) => {
    await page.evaluate(async (audioLink: string) => {
        const source = document.querySelector('#audio-to-play > source') as HTMLSourceElement;
        const audioUrlSplit = audioLink.split('.');
        const audioUrlExtension = audioUrlSplit[audioUrlSplit.length - 1] || '';

        const extensionToType = {
            avi: 'video/x-msvideo',
            m3u8: 'application/x-mpegURL',
            mkv: 'video/x-matroska',
            mp4: 'video/mp4',
            webm: 'video/webm',
        };

        if (audioUrlExtension in extensionToType) {
            //@ts-ignore
            source.type = extensionToType[audioUrlExtension];
            return;
        }

        const requestOnAudioUrl = await fetch(audioLink);
        const audioUrlContentType = requestOnAudioUrl.headers.get('Content-Type');

        if (audioUrlContentType) {
            source.type = audioUrlContentType;
        }
    }, audioLink);
};
