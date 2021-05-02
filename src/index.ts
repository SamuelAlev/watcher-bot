import path from 'path';
import puppeteer from 'puppeteer-extra';
import type { LaunchOptions, Page } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as dotenv from 'dotenv';
import { fastify } from 'fastify';
import FastifyStatic from 'fastify-static';
import FastifyCors from 'fastify-cors';

import addCanvasTagInPage from './functions/addCanvasTagInPage';
import addVideoTagInPage from './functions/addVideoTagInPage';
import bindEmptyMediaStreamToScreenShare from './functions/bindEmptyMediaStreamToScreenShare';
import bindQueueToVideoTag from './functions/bindQueueToVideoTag';
import bindVideoTagToCanvasTag from './functions/bindVideoTagToCanvasTag';
import removeTooltip from './functions/removeTooltip';
import setSrcToLoopVideo from './functions/setSrcToLoopVideo';
import startVideo from './functions/startVideo';
import unbindAudioFromScreenShareMediaStream from './functions/unbindAudioFromScreenShareMediaStream';

import loop from './commands/loop';
import np from './commands/np';
import pause from './commands/pause';
import play from './commands/play';
import resume from './commands/resume';
import seek from './commands/seek';
import speed from './commands/speed';
import stop from './commands/stop';
import volume from './commands/volume';
import addAudioTagInPage from './functions/addAudioTagInPage';
import unbindVideoFromScreenShareMediaStream from './functions/unbindVideoFromScreenShareMediaStream';
import bindVideoToScreenShareMediaStream from './functions/bindVideoToScreenShareMediaStream';
import removeSrcFromVideoTag from './functions/removeSrcFromVideoTag';
import removeSrcFromAudioTag from './functions/removeSrcFromAudioTag';
import setVideoLoop from './functions/setVideoLoop';
import loginOnDiscord from './functions/loginOnDiscord';
import sendMessage, { MessageEmbed } from './functions/sendMessage';

dotenv.config();

const {
    CHROME_BIN,
    WEBSERVER_PORT,
    BOT_PREFIX,
    DISCORD_DOMAIN,
    DISCORD_LOGIN_PATH,
    DISCORD_SERVER_ID,
    DISCORD_BOT_COMMAND_CHANNEL_ID,
} = process.env;

const DEBUG = process.env.DEBUG === 'true';
const HEADLESS = process.env.HEADLESS === 'true';

export interface State {
    audioStreamBound: boolean;
    videoStreamBound: boolean;
    connectedToVoiceChannel: boolean;
    screenShared: boolean;
    isVideoPlaying: boolean;
}

const state: State = {
    audioStreamBound: false,
    videoStreamBound: false,
    connectedToVoiceChannel: false,
    screenShared: false,
    isVideoPlaying: false,
};

export type Command = (page: Page, state: State, parameters: string[]) => Promise<void>;

export interface CommandList {
    [key: string]: Command;
}

const commands: CommandList = {
    loop,
    np,
    pause,
    play,
    resume,
    seek,
    speed,
    stop,
    volume,
};

export interface MessageMetadata {
    author: string;
    authorId: string;
    createdAt: string;
}

(async () => {
    const server = fastify();

    server.register(FastifyCors);
    server.register(FastifyStatic, {
        root: path.join(__dirname, 'media'),
    });

    server.listen(WEBSERVER_PORT);

    const browser = await puppeteer.use(StealthPlugin()).launch({
        executablePath: CHROME_BIN,
        args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',

            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
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
        DEBUG && console.log('Starting loop video');

        await unbindVideoFromScreenShareMediaStream(page, state);
        await unbindAudioFromScreenShareMediaStream(page, state);
        await removeSrcFromVideoTag(page);
        await removeSrcFromAudioTag(page);
        await setSrcToLoopVideo(page, state);
        await setVideoLoop(page, true);
        await bindVideoToScreenShareMediaStream(page, state);
        await startVideo(page);
    });

    await page.exposeFunction('onNewMessageReceived', async (message: string) => {
        if (message.startsWith(BOT_PREFIX)) {
            DEBUG && console.log('=== New command received ===');

            const command = message.split(' ')[0].replace(BOT_PREFIX, '');
            const parameters = (message.match(/(?:[^\s"]+|"[^"]*")+/g) || []).splice(1);

            DEBUG && console.log(`${command}(${parameters.join(', ')})`);

            if (command in commands) {
                commands[command](page, state, parameters);
            }
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
