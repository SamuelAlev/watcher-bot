import * as dotenv from 'dotenv';
import { join } from 'path';
import puppeteer from 'puppeteer-extra';
import sqlite3, { Database } from 'sqlite3';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { LaunchOptions, Page } from 'puppeteer';

import addAudioTagInPage from './functions/addAudioTagInPage';
import addCanvasTagInPage from './functions/addCanvasTagInPage';
import addVideoTagInPage from './functions/addVideoTagInPage';
import bindEmptyMediaStreamToScreenShare from './functions/bindEmptyMediaStreamToScreenShare';
import bindQueueToVideoTag from './functions/bindQueueToVideoTag';
import bindVideoTagToCanvasTag from './functions/bindVideoTagToCanvasTag';
import initDatabase from './functions/initDatabase';
import loginOnDiscord from './functions/loginOnDiscord';
import playVideoOnScreenShareMediaStream from './functions/playVideoOnScreenShareMediaStream';
import removeTooltip from './functions/removeTooltip';
import sendMessage from './functions/sendMessage';

import clear from './commands/clear';
import loop from './commands/loop';
import np from './commands/np';
import pause from './commands/pause';
import play from './commands/play';
import queue from './commands/queue';
import resume from './commands/resume';
import seek from './commands/seek';
import skip from './commands/skip';
import speed from './commands/speed';
import stop from './commands/stop';
import volume from './commands/volume';

import countItemInQueue from './database/countItemInQueue';
import getFirstItemInQueue from './database/getFirstItemInQueue';
import updateItemStatusById from './database/updateItemStatusById';

dotenv.config();

const {
    CHROME_BIN,
    BOT_PREFIX,
    DISCORD_DOMAIN,
    DISCORD_LOGIN_PATH,
    DISCORD_SERVER_ID,
    DISCORD_BOT_COMMAND_CHANNEL_ID,
    DISABLE_GPU,
} = process.env;

const DEBUG = process.env.DEBUG === 'true';
const HEADLESS = process.env.HEADLESS !== 'false';

export interface State {
    audioStreamBound: boolean;
    videoStreamBound: boolean;
    connectedToVoiceChannel: boolean;
    screenShared: boolean;
    currentlyPlaying?: QueueItem;
}

const state: State = {
    audioStreamBound: false,
    videoStreamBound: false,
    connectedToVoiceChannel: false,
    screenShared: false,
    currentlyPlaying: undefined,
};

export type Command = (page: Page, state: State, database: Database, parameters: string[]) => Promise<void>;

export interface CommandList {
    [key: string]: Command;
}

const commands: CommandList = {
    clear,
    c: clear,
    loop,
    np,
    pause,
    play,
    p: play,
    queue,
    q: queue,
    resume,
    r: resume,
    seek,
    skip,
    s: skip,
    speed,
    stop,
    volume,
    v: volume,
};

export enum PlayStatus {
    Error = 0,
    Queued = 1,
    Playing = 2,
    Played = 3,
}

export interface QueueItem {
    id: number;
    originalVideoLink: string;
    videoLink: string;
    audioLink: string;
    status: PlayStatus;
    createdAt: string;
}

(async () => {
    const database = await new Promise<Database>((resolve) => {
        const dbInstance = new sqlite3.Database(join(__dirname, 'database', 'bot.db'), (error) => {
            if (error) {
                console.error("Can't open the database");
                process.exit(-1);
            }
            resolve(dbInstance);
        });
    });

    await initDatabase(database);

    const browser = await puppeteer.use(StealthPlugin()).launch({
        executablePath: CHROME_BIN || 'google-chrome-stable',
        args: [
            '--no-sandbox',

            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',

            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',

            ...((DISABLE_GPU === 'true' && ['--disable-gpu', '--disable-software-rasterizer']) || []),
        ],
        headless: HEADLESS,
    } as LaunchOptions);

    const page = await browser.newPage();

    await page.setBypassCSP(true);

    await page.goto(
        `${DISCORD_DOMAIN}${DISCORD_LOGIN_PATH}?redirect_to=%2Fchannels%2F${DISCORD_SERVER_ID}%2F${DISCORD_BOT_COMMAND_CHANNEL_ID}` as string,
        { waitUntil: 'networkidle2' },
    );

    await loginOnDiscord(page);

    await page.waitForSelector('#channels', { visible: true });
    DEBUG && console.log('Logged in!');

    const messagesList = await page.$('div[data-list-id="chat-messages"]');
    if (!messagesList) {
        throw new Error("Couldn't get the messages list");
    }

    await removeTooltip(page);
    await addCanvasTagInPage(page);
    await addVideoTagInPage(page);
    await addAudioTagInPage(page);
    await bindQueueToVideoTag(page);
    await bindVideoTagToCanvasTag(page);
    await bindEmptyMediaStreamToScreenShare(page);

    await page.exposeFunction('logger', console.log);

    await page.exposeFunction('onVideoEnded', async () => {
        if (state.currentlyPlaying) {
            await updateItemStatusById(database, PlayStatus.Played, state.currentlyPlaying.id);
        } else {
            throw new Error('Currently playing is not set');
        }

        const count = await countItemInQueue(database);

        if (count) {
            DEBUG && console.log('Video ended, next video will arrive');

            const item = await getFirstItemInQueue(database);

            await updateItemStatusById(database, PlayStatus.Playing, item.id);
            state.currentlyPlaying = item;
            await playVideoOnScreenShareMediaStream(page, state, database, item.videoLink, item.audioLink);
        } else {
            DEBUG && console.log('Video ended, leaving');

            await stop(page, state, database);
        }
    });

    await page.exposeFunction('onNewMessageReceived', async (message: string) => {
        if (message.startsWith(BOT_PREFIX)) {
            DEBUG && console.log('=== New command received ===');

            const command = message.split(' ')[0].replace(BOT_PREFIX, '');
            const parameters = (message.match(/(?:[^\s"]+|"[^"]*")+/g) || []).splice(1);

            DEBUG && console.log(`${command}(${parameters.join(', ')})`);

            if (command in commands) {
                return commands[command](page, state, database, parameters);
            }

            return await sendMessage({
                title: 'Error',
                description: `
                    The command "${command}" doesn't exist.
                    You can get the command list with **${BOT_PREFIX}help**.
                 `,
            });
        }
    });

    await page.evaluate(() => {
        const target = document.querySelector('div[data-list-id="chat-messages"]') as Node;
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const newElement = mutation.addedNodes[0] as Element;
                    const messageElement = Array.from(newElement.classList).find((className: string) =>
                        className.startsWith('message-'),
                    );
                    if (messageElement) {
                        //TODO: add message metadata (author, authorId, createdAt, ...)
                        window.onNewMessageReceived(
                            (newElement.querySelector('div[class*="message"]') as HTMLParagraphElement).innerText,
                        );
                    }
                }
            }
        });

        observer.observe(target, { childList: true, subtree: true, characterDataOldValue: true });
    });

    console.log('Ready to receive messages');
})();
