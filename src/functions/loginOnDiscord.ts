import { Page } from 'puppeteer';

export default async (page: Page) => {
    const { DISCORD_MAIL_ADDRESS, DISCORD_PASSWORD } = process.env;

    const DEBUG = process.env.DEBUG === 'true';

    const email = await page.$('input[name=email]');
    if (!email) {
        throw new Error('No email field found');
    }

    await email.type(DISCORD_MAIL_ADDRESS as string);

    const password = await page.$('input[name=password]');
    if (!password) {
        throw new Error('No password field found');
    }

    await password.type(DISCORD_PASSWORD as string);

    DEBUG && (await page.screenshot({ path: 'logs/1-credentials-set.jpg' }));

    await page.click('button[type="submit"]');

    DEBUG && (await page.screenshot({ path: 'logs/2-log-in.jpg' }));
};
