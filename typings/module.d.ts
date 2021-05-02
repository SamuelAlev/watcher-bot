declare namespace NodeJS {
    export interface ProcessEnv {
        CHROME_BIN: string;
        DEBUG: string;
        HEADLESS: string;
        VIDEO_FPS: string;
        WEBSERVER_PORT: string;
        BOT_NAME: string;
        BOT_AVATAR: string;
        DISCORD_DOMAIN: string;
        DISCORD_LOGIN_PATH: string;
        DISCORD_MAIL_ADDRESS: string;
        DISCORD_PASSWORD: string;
        DISCORD_SERVER_ID: string;
        DISCORD_BOT_COMMAND_CHANNEL_ID: string;
        DISCORD_VOICE_CHANNEL_ID: string;
        DISCORD_WEBHOOK_URL: string;
    }
}
