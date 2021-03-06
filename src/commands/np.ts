import { Page } from 'puppeteer';
import { State } from '..';
import getVideoDuration from '../functions/getVideoDuration';
import getVideoTime from '../functions/getVideoTime';
import sendMessage, { MessageEmbedColor } from '../functions/sendMessage';

const formatToHHMMSS = (seconds: number) => {
    const format = (val: number) => `0${Math.floor(val)}`.slice(-2);
    const hours = seconds / 3600;
    const minutes = (seconds % 3600) / 60;

    return [hours, minutes, seconds % 60].map(format).join(':');
};

export default async (page: Page, state: State) => {
    const duration = await getVideoDuration(page);
    const currentTime = await getVideoTime(page);

    if (state.currentlyPlaying) {
        await sendMessage({
            title: 'Now Playing',
            description: `
                Link: ${state.currentlyPlaying.originalVideoLink}
                Current time: ${formatToHHMMSS(currentTime)}/${formatToHHMMSS(duration || 0)}
            `,
        });
    } else {
        return await sendMessage({
            title: 'Now Playing',
            description: 'No video is currently playing',
            color: MessageEmbedColor.Error,
        });
    }
};
