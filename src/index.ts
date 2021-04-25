import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import { fastify } from 'fastify';
import FastifyStatic from 'fastify-static';
import FastifyCors from 'fastify-cors';

dotenv.config();

const {
    DISCORD_DOMAIN,
    DISCORD_LOGIN_PATH,
    DISCORD_MAIL_ADDRESS,
    DISCORD_PASSWORD,
    DISCORD_SERVER_ID,
    DISCORD_BOT_CHANNEL_ID,
    DISCORD_VOICE_CHANNEL_ID,
} = process.env;

(async () => {
    const server = fastify({});

    server.register(FastifyCors);
    server.register(FastifyStatic, {
        root: path.join(__dirname, 'media'),
    });

    server.listen(3000);

    // const videoPath = path.resolve(__dirname, 'media', 'test.y4m');
    // const audioPath = path.resolve(__dirname, 'media', 'test.wav');

    // console.log(process.cwd());
    

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
            '--window-size=1200,800',

            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            // `--use-file-for-fake-video-capture=src/media/bear.mjpeg`,
            // `--use-file-for-fake-audio-capture="${audioPath}"`,
            // '--disable-gesture-requirement-for-media-playback',
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ],
        // ignoreDefaultArgs: ['--mute-audio'],
        // headless: false,
    });

    const page = await browser.newPage();

    const preloadFile = fs.readFileSync(path.join(__dirname, 'preload.js'), 'utf8');
    await page.evaluateOnNewDocument(preloadFile);

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

    console.log("Credentials set");
    await page.screenshot({path: 'logs/1-credentials-set.jpg'})

    await page.click('button[type="submit"]');

    console.log("Log in");
    await page.screenshot({path: 'logs/2-log-in.jpg'})

    /**
     * Message watcher
     */
    console.log('Server successfully shown');
    await page.waitForSelector('#channels', { visible: true });

    const messagesList = await page.$('div[data-list-id="chat-messages"]')
    if (!messagesList) {
        throw new Error('Couldn\'t get the messages list')
    }

    await page.exposeFunction('puppeteerMutationListener', async (message: string) => {
        console.log('New message received', message);

        if (message.startsWith('$$')) {
            if(message.startsWith('$$play')) {
                let videoPath = (message.match(/(?:[^\s"]+|"[^"]*")+/g) || [])[1]

                if (!videoPath) {
                    throw new Error('No link given');
                }

                videoPath = videoPath.replace(/^"|"$/g, '')

                try {
                    await unbindVideoFromScreenShare(page)
                    await removeTooltip(page)
                    const metadata: any = await bindVideoToScreenShare(page, videoPath);
                    await playVideo(page)
                    await connectToVoiceChannel(page);
                    await shareScreen(page, metadata.duration);
                } catch {
                    await unbindVideoFromScreenShare(page)
                    console.error('Couldn\'t connect and stream')
                }
            } else if (message === '$$stop') {
                try {
                    await disconnectFromVoiceChannel(page)
                    await unbindVideoFromScreenShare(page)
                } catch {
                    console.error('Couldn\'t disconnect from the stream')
                }
            }
        }
    });

    await page.evaluate(() => {
        const target = document.querySelector('div[data-list-id="chat-messages"]') as Node;
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const newElement = mutation.addedNodes[0]
                    //@ts-ignore
                    const messageElement = Array.from(newElement.classList).find(className => className.startsWith('message-'))
                    if(messageElement) {
                        //@ts-ignore
                       puppeteerMutationListener(newElement.querySelector('div[class*="message"]').innerText)
                    }
                    
                }
            }
        });

        observer.observe(target, { childList: true, subtree: true, characterDataOldValue: true });
    });
})();

const removeTooltip = async (page: puppeteer.Page) => {
    const tooltip = await page.$('div[class*="channelNotice-"] > div[class*="close-"]');
    if (!tooltip) {
        console.log('No tooltip to hide')
        return
    }

    await tooltip.click()
}

const connectToVoiceChannel = async (page: puppeteer.Page) => {
    await page.screenshot({path: 'logs/3-show-server.jpg'})

    const voiceChannelElement = await page.$(`a[data-list-item-id="channels___${DISCORD_VOICE_CHANNEL_ID as string}"]`);

    if (!voiceChannelElement) {
        throw new Error("Haven't found the channel by ID");
    }
    await voiceChannelElement.click();

    console.log('Voice channel clicked');
    await page.screenshot({path: 'logs/4-voice-channel-clicked.jpg'})
}

const disconnectFromVoiceChannel = async (page:puppeteer.Page) => {
    const disconnectButton = await page.$('div[class*="connection-"] > div:last-child > button')
    if (!disconnectButton) {
        throw new Error('Can\' disconnect from the server')
    }

    disconnectButton.click()
}

const bindVideoToScreenShare = async (page: puppeteer.Page, videoPath: string) => {
    return await page.evaluate((videoPath) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');

            video.setAttribute('id', 'video-to-play');
            video.setAttribute('src', videoPath);
            video.setAttribute('crossorigin', 'anonymous');
            video.setAttribute('controls', '');

            video.oncanplay = () => {
                //@ts-ignore
                const stream = video.captureStream(25);
                //@ts-ignore
                navigator.mediaDevices.getDisplayMedia = () => Promise.resolve(stream);

                resolve({
                    duration: video.duration
                })
            };

            video.onerror = () => reject('Error while adding the video')

            //@ts-ignore
            document.querySelector('body').appendChild(video);
        })
    }, videoPath);
}

const unbindVideoFromScreenShare = async (page: puppeteer.Page) => {
    await page.evaluate(() => {
        document.getElementById("video-to-play")?.remove();

        //@ts-ignore
        navigator.mediaDevices.getDisplayMedia = () => {
            console.error('No video linked to the screen share')
        }
    })
}

const shareScreen = async (page: puppeteer.Page, duration: number) => {
    console.log('Video duration', duration);
    
    duration && setTimeout(async () => {
        console.log("Video is over, disconnecting...");
        
        await unbindVideoFromScreenShare(page)
        await stopScreenSharing(page)
    }, duration * 1000)

    const shareScreenButtonElement = await page.$('div[class^="actionButtons-"] > button:nth-child(2)')
    if (!shareScreenButtonElement) {
        throw new Error("The \"Share Screen\" button has not been found");
    }
    await shareScreenButtonElement.click();

    console.log('Share screen button clicked');
    await page.screenshot({path: 'logs/5-share-screen-button-clicked.jpg'})
}

const stopScreenSharing = async (page: puppeteer.Page) => {
    const shareScreenButtonElement = await page.$('div[class^="actionButtons-"] > button:nth-child(2)')
    if (!shareScreenButtonElement) {
        throw new Error("The \"Share Screen\" button has not been found");
    }
    await shareScreenButtonElement.click();

    const stopScreenSharingElement = await page.$('#manage-streams-stop-streaming')
    if (!stopScreenSharingElement) {
        throw new Error("The \"Stop Share Screen\" button has not been found");
    }
    await stopScreenSharingElement.click();
}

const playVideo = async (page: puppeteer.Page) => {
    //@ts-ignore
    await page.$eval('#video-to-play', (video) => video.play());
}

