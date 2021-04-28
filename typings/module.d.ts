declare namespace NodeJS {
    export interface ProcessEnv {
        DEBUG: string;
        VIDEO_FPS: string;
        WEBSERVER_PORT: string;
        DISCORD_DOMAIN: string;
        DISCORD_LOGIN_PATH: string;
        DISCORD_MAIL_ADDRESS: string;
        DISCORD_PASSWORD: string;
        DISCORD_SERVER_ID: string;
        DISCORD_BOT_CHANNEL_ID: string;
        DISCORD_VOICE_CHANNEL_ID: string;
    }
}
