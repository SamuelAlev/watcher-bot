import { Page } from 'puppeteer';
import startVideo from '../functions/startVideoAndAudioTags';

export default async (page: Page) => {
    await startVideo(page);
};
