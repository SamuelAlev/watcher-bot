import { Page } from 'puppeteer';
import { State } from '..';
import setSrcOnVideoTag from './setSrcOnVideoTag';

export default async (page: Page, state: State) => {
    const { WEBSERVER_PORT } = process.env;

    await setSrcOnVideoTag(page, `http://localhost:${WEBSERVER_PORT}/loop-1.mp4`);
};
