import youtubedl from 'youtube-dl-exec';
export interface VideoSources {
    videoLink: string;
    audioLink: string;
}

export default async function (url: string): Promise<VideoSources> {
    const DEBUG = process.env.DEBUG === 'true';

    const videoSrc: VideoSources = {
        videoLink: '',
        audioLink: '',
    };

    DEBUG && console.log('Getting the video and audio from youtube');

    try {
        const content = await youtubedl(url, {
            getUrl: true,
            format: '137+141/best',
        });

        //@ts-ignore
        const contentArray = content.split('\n');

        videoSrc.videoLink = contentArray[0];
        videoSrc.audioLink = contentArray[1] || contentArray[0];
    } catch {
        throw new Error("Couldn't get the video");
    }

    return videoSrc;
}
