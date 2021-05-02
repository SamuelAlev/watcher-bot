import fetch from 'node-fetch';

export enum MessageEmbedColor {
    Success = 1096065,
    Error = 14427686,
}

export interface MessageEmbed {
    title?: string;
    description?: string;
    color?: MessageEmbedColor;
}

export default async (message: MessageEmbed) => {
    const { BOT_NAME, BOT_AVATAR, DISCORD_WEBHOOK_URL } = process.env;

    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: null,
            embeds: [
                {
                    title: message.title,
                    description: message.description,
                    color: message.color || MessageEmbedColor.Success,
                },
            ],
            username: BOT_NAME,
            avatar_url: BOT_AVATAR,
        }),
    });
};
