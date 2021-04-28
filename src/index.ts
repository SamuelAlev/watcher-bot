import path from 'path';
import puppeteer from 'puppeteer-extra';
import type { LaunchOptions, Page } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as dotenv from 'dotenv';
import { fastify } from 'fastify';
import FastifyStatic from 'fastify-static';
import FastifyCors from 'fastify-cors';

dotenv.config();

const {
    VIDEO_FPS,
    WEBSERVER_PORT,
    DISCORD_DOMAIN,
    DISCORD_LOGIN_PATH,
    DISCORD_MAIL_ADDRESS,
    DISCORD_PASSWORD,
    DISCORD_SERVER_ID,
    DISCORD_BOT_CHANNEL_ID,
    DISCORD_VOICE_CHANNEL_ID,
} = process.env;

const DEBUG = process.env.DEBUG === 'true';

interface State {
    streamAlreadyBound: boolean;
    connectedToVoiceChannel: boolean;
    screenShared: boolean;
}

const state: State = {
    streamAlreadyBound: false,
    connectedToVoiceChannel: false,
    screenShared: false,
};

const removeTooltip = async (page: Page) => {
    const tooltip = await page.$('div[class*="channelNotice-"] > div[class*="close-"]');
    if (!tooltip) {
        DEBUG && console.log('No tooltip to hide');
        return;
    }
    DEBUG && console.log('Hiding tooltip');

    await tooltip.click();
};

const connectToVoiceChannel = async (page: Page) => {
    if (DEBUG) {
        console.log('Connect from voice channel');
        await page.screenshot({ path: 'logs/3-show-server.jpg' });
    }

    const voiceChannelElement = await page.$(`a[data-list-item-id="channels___${DISCORD_VOICE_CHANNEL_ID as string}"]`);

    if (!voiceChannelElement) {
        throw new Error("Haven't found the channel by ID");
    }
    await voiceChannelElement.click();

    state.connectedToVoiceChannel = true;

    if (DEBUG) {
        console.log('Voice channel clicked');
        await page.screenshot({ path: 'logs/4-voice-channel-clicked.jpg' });
    }
};

const disconnectFromVoiceChannel = async (page: Page) => {
    DEBUG && console.log('Disconnect from voice channel');

    const disconnectButton = await page.$('div[class*="connection-"] > div:last-child > button');
    if (!disconnectButton) {
        throw new Error("Can't disconnect from the server");
    }

    state.connectedToVoiceChannel = false;

    await disconnectButton.click();
};

const addVideoTagInPage = async (page: Page) => {
    DEBUG && console.log('Adding `video` tag to the page');

    await page.evaluate(() => {
        return new Promise<void>((resolve, reject) => {
            const video = document.createElement('video');

            video.setAttribute('id', 'video-to-play');
            video.setAttribute('crossorigin', 'anonymous');
            video.setAttribute('controls', '');

            video.onerror = () => reject('Error while adding the video');

            (document as HTMLDocument).body.appendChild(video);

            return resolve();
        });
    });
};

const addCanvasTagInPage = async (page: Page) => {
    DEBUG && console.log('Adding `canvas` tag to the page');

    await page.evaluate(() => {
        return new Promise<void>((resolve, reject) => {
            const canvas = document.createElement('canvas');

            canvas.setAttribute('id', 'canvas');

            canvas.onerror = () => reject('Error while adding the video');

            (document as HTMLDocument).body.appendChild(canvas);

            return resolve();
        });
    });
};

const setSrcOnVideoTag = async (page: Page, videoPath: string) => {
    DEBUG && console.log('Adding `src` attribute to video tag');

    return await page.evaluate((videoPath: string) => {
        return new Promise<void>((resolve, reject) => {
            const video = document.getElementById('video-to-play');
            if (!video) {
                return reject("Could't find the video tag");
            }

            video.setAttribute('src', videoPath);

            video.oncanplay = () => resolve();
        });
    }, videoPath);
};

const removeSrcToVideoTag = async (page: Page) => {
    DEBUG && console.log('Removing `src` attribute to video tag');

    await page.evaluate(() => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            throw new Error("Could't find the video tag");
        }

        video.removeAttribute('src');
    });
};

const bindVideoTagToCanvasTag = async (page: Page) => {
    DEBUG && console.log('Bind `video` tag to `canvas` tag');

    await page.evaluate(() => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            throw new Error("Could't find the video tag");
        }

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Could't find the canvas tag");
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Could't get canvas context");
        }

        video.onplay = () => {
            const frame = () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        };
    });
};

const bindMixedStreamToScreenShare = async (page: Page) => {
    if (DEBUG) {
        console.log('Bind mixed stream to `getDisplayMedia`');
        console.log('Video FPS:', VIDEO_FPS);
    }

    await page.evaluate((VIDEO_FPS: number) => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            throw new Error("Could't find the video tag");
        }

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Could't find the canvas tag");
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Could't get canvas context");
        }

        const mixedStream = new MediaStream([
            canvas.captureStream(VIDEO_FPS).getVideoTracks()[0],
            video.captureStream(VIDEO_FPS).getAudioTracks()[0],
        ]);

        window.setStreamAlreadyBound(true);
        (navigator as Navigator).mediaDevices.getDisplayMedia = () => Promise.resolve(mixedStream);
    }, parseInt(VIDEO_FPS));
};

const shareScreen = async (page: Page) => {
    const shareScreenButtonElement = await page.$('div[class^="actionButtons-"] > button:nth-child(2)');
    if (!shareScreenButtonElement) {
        throw new Error('The "Share Screen" button has not been found');
    }
    await shareScreenButtonElement.click();

    state.screenShared = true;

    if (DEBUG) {
        console.log('Share screen button clicked');
        await page.screenshot({ path: 'logs/5-share-screen-button-clicked.jpg' });
    }
};

const stopScreenSharing = async (page: Page) => {
    const shareScreenButtonElement = await page.$('div[class^="actionButtons-"] > button:nth-child(2)');
    if (!shareScreenButtonElement) {
        throw new Error('The "Share Screen" button has not been found');
    }
    await shareScreenButtonElement.click();

    const stopScreenSharingElement = await page.$('#manage-streams-stop-streaming');
    if (!stopScreenSharingElement) {
        throw new Error('The "Stop Share Screen" button has not been found');
    }
    await stopScreenSharingElement.click();
};

const startVideo = async (page: Page) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).play();
    });
};

const setVideoVolume = async (page: Page, volume: number) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).volume = volume / 100;
    });
};

const setVideoSpeed = async (page: Page, speed: number) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).playbackRate = speed;
    });
};

const setVideoTime = async (page: Page, time: number) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).currentTime = time;
    });
};

const getVideoTime = async (page: Page): Promise<number> => {
    const currentTime = await page.$eval<number>(
        '#video-to-play',
        (video): number => (video as HTMLVideoElement).currentTime,
    );

    console.log('Current time:', currentTime);

    return currentTime;
};

const getVideoDuration = async (page: Page): Promise<number> => {
    const duration = await page.$eval<number>(
        '#video-to-play',
        (video): number => (video as HTMLVideoElement).duration,
    );

    console.log('Duration', duration);

    return duration;
};

const pauseVideo = async (page: Page) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).pause();
    });
};

const toggleVideoLoop = async (page: Page) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).loop = !(video as HTMLVideoElement).loop;
    });
};

const setVideoLoopFalse = async (page: Page) => {
    await page.$eval('#video-to-play', (video) => {
        (video as HTMLVideoElement).loop = false;
    });
};

const setSrcToLoopVideo = async (page: Page) => {
    await toggleVideoLoop(page);
    await setSrcOnVideoTag(page, `http://localhost:${WEBSERVER_PORT}/loop.mp4`);
};

const bindQueueToVideoTag = async (page: Page) => {
    DEBUG && console.log('Bind queue to video tag');

    await page.evaluate(() => {
        const video = document.getElementById('video-to-play') as HTMLVideoElement;
        if (!video) {
            throw new Error("Could't find the video tag");
        }

        video.onended = () => {
            if (!video.loop) {
                window.onVideoEnded();
            }
        };
    });
};

(async () => {
    const server = fastify();

    server.register(FastifyCors);
    server.register(FastifyStatic, {
        root: path.join(__dirname, 'media'),
    });

    server.listen(WEBSERVER_PORT);

    const browser = await puppeteer.use(StealthPlugin()).launch({
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',

            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
        ],
        // ignoreDefaultArgs: ['--mute-audio'],
        // headless: false,
    } as LaunchOptions);

    const page = await browser.newPage();

    await page.setBypassCSP(true);

    await page.goto(
        `${DISCORD_DOMAIN}${DISCORD_LOGIN_PATH}?redirect_to=%2Fchannels%2F${DISCORD_SERVER_ID}%2F${DISCORD_BOT_CHANNEL_ID}` as string,
        { waitUntil: 'networkidle2' },
    );

    /**
     * Login on Discord
     */
    const email = await page.$('input[name=email]');
    if (!email) {
        throw new Error('No email field found');
    }
    await email.focus();
    await email.type(DISCORD_MAIL_ADDRESS as string);

    const password = await page.$('input[name=password]');
    if (!password) {
        throw new Error('No password field found');
    }
    await password.focus();
    await password.type(DISCORD_PASSWORD as string);

    await page.screenshot({ path: 'logs/1-credentials-set.jpg' });

    await page.click('button[type="submit"]');

    await page.screenshot({ path: 'logs/2-log-in.jpg' });

    /**
     * Message watcher
     */
    await page.waitForSelector('#channels', { visible: true });
    DEBUG && console.log('Logged in!');

    const messagesList = await page.$('div[data-list-id="chat-messages"]');
    if (!messagesList) {
        throw new Error("Couldn't get the messages list");
    }

    await removeTooltip(page);
    await addCanvasTagInPage(page);
    await addVideoTagInPage(page);
    await bindVideoTagToCanvasTag(page);

    await page.exposeFunction('logger', console.log);

    await page.exposeFunction('onVideoEnded', async () => {
        await setSrcToLoopVideo(page);
        await startVideo(page);
    });

    await page.exposeFunction('setStreamAlreadyBound', (value: boolean) => {
        state.streamAlreadyBound = value;
    });

    await page.exposeFunction('onNewMessageReceived', async (message: string) => {
        DEBUG && console.log('New message received:', message);

        if (message.startsWith('$$')) {
            if (message.startsWith('$$play')) {
                let videoPath = (message.match(/(?:[^\s"]+|"[^"]*")+/g) || [])[1];

                if (!videoPath) {
                    throw new Error('No link given');
                }

                videoPath = videoPath.replace(/^"|"$/g, '');

                try {
                    //Reset attributes
                    await setVideoLoopFalse(page);

                    await setSrcOnVideoTag(page, videoPath);

                    // if (!state.streamAlreadyBound) {
                    await bindMixedStreamToScreenShare(page);
                    // }

                    await startVideo(page);

                    if (!state.connectedToVoiceChannel) {
                        await connectToVoiceChannel(page);
                    }

                    if (!state.screenShared) {
                        await shareScreen(page);
                    }

                    await bindQueueToVideoTag(page);
                } catch (e) {
                    await setSrcToLoopVideo(page);
                    console.error("Couldn't connect and stream", e);
                }
            } else if (message === '$$resume') {
                await startVideo(page);
            } else if (message === '$$pause') {
                await pauseVideo(page);
            } else if (message === '$$stop') {
                try {
                    await removeSrcToVideoTag(page);
                    await disconnectFromVoiceChannel(page);
                } catch (e) {
                    console.error("Couldn't disconnect from the stream:", e);
                }
            } else if (message.startsWith('$$seek')) {
                const time = parseInt(message.split(' ')[1]);
                if (!time) {
                    throw new Error('No time given');
                }
                await setVideoTime(page, time);
            } else if (message.startsWith('$$volume')) {
                const volume = parseInt(message.split(' ')[1]);
                if (!volume) {
                    throw new Error('No volume given');
                }
                await setVideoVolume(page, volume);
            } else if (message.startsWith('$$speed')) {
                const speed = parseInt(message.split(' ')[1]);
                if (!speed) {
                    throw new Error('No speed given');
                }
                await setVideoSpeed(page, speed);
            } else if (message === '$$loop') {
                await toggleVideoLoop(page);
            } else if (message === '$$np') {
                console.log(await getVideoTime(page));
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
