import { Page } from 'puppeteer';
import { State } from '..';
import getVideoTime from '../functions/getVideoTime';

export default async (page: Page, state: State) => {
    await getVideoTime(page);
};
