import { join } from 'node:path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { parse, stringify } from 'envfile';
import { readFileSync, copyFileSync, writeFileSync } from 'node:fs';
import { getChromeBinaryLocation } from './helpers/getChromeBinaryLocation';
//@ts-ignore
import dialog from 'dialog';

(async () => {
    // Copy .env.template to .env
    copyFileSync(join(__dirname, '..', '..', '.env.template'), join(__dirname, '..', '..', '.env'));
    console.log('Created .env file');

    // Load keys
    const envFileContent = readFileSync(join(__dirname, '..', '..', '.env'), {
        encoding: 'utf-8',
    });
    const envKeys = parse(envFileContent) as Record<string, string>;

    // Set Chrome path
    let chromePath;
    try {
        if (!envKeys['CHROME_BIN']) {
            chromePath = await getChromeBinaryLocation();
            console.log('Found Chrome path:', chromePath);
            envKeys['CHROME_BIN'] = chromePath || 'Chrome not found';
            // Write to .env files
            writeFileSync(join(__dirname, '..', '..', '.env'), stringify(envKeys));
        }
    } catch {
        console.error('Chrome not found');
        return;
    }

    // Register a new account on Discord
    const browser = await puppeteer.use(StealthPlugin()).launch({
        executablePath: envKeys['CHROME_BIN'],
        args: ['--disable-notifications'],
        headless: false,
    });

    const page = await browser.newPage();

    const context = browser.defaultBrowserContext();
    context.overridePermissions(envKeys['DISCORD_DOMAIN'], ['clipboard-read']);

    await page.setBypassCSP(true);

    await page.goto(`${envKeys['DISCORD_DOMAIN']}/register`);

    const usernameInput = await page.$('[name="username"]');
    await usernameInput?.type(envKeys['BOT_NAME']);

    const birthdayMonthSelect = await page.$('[class*="month-"]');
    await birthdayMonthSelect?.click();
    const monthJanuaryOption = await page.$('#react-select-2-option-0');
    await monthJanuaryOption?.click();

    const birthdayDaySelect = await page.$('[class*="day-"]');
    await birthdayDaySelect?.click();
    const dayFirstOption = await page.$('#react-select-3-option-0');
    await dayFirstOption?.click();

    const birthdayYearSelect = await page.$('[class*="year-"]');
    await birthdayYearSelect?.click();
    const yearMajoroption = await page.$('#react-select-4-option-18');
    await yearMajoroption?.click();

    const tosCheckbox = await page.$('[type="checkbox"]');
    await tosCheckbox?.click();

    await page.addStyleTag({ path: join(__dirname, 'inject', 'tooltip.css') });
    await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.9.2/umd/popper.min.js',
    });
    await page.addScriptTag({
        path: join(__dirname, 'inject', 'registerStep.js'),
    });

    await page.exposeFunction('onEmailInput', (value: string) => {
        envKeys['DISCORD_MAIL_ADDRESS'] = value;
    });

    await page.exposeFunction('onPasswordInput', (value: string) => {
        envKeys['DISCORD_PASSWORD'] = value;
    });

    await page.waitForNavigation({ timeout: 0 });

    // Write to .env files
    writeFileSync(join(__dirname, '..', '..', '.env'), stringify(envKeys));

    // Show Verify Your Email
    const mailVerificationStepHtml = readFileSync(join(__dirname, 'inject', 'mailVerificationStep.html'), 'utf8');
    await page.setContent(mailVerificationStepHtml);

    // Accept the invitation
    await page.waitForNavigation({ timeout: 0, waitUntil: 'networkidle2' });

    const acceptInvitation = await page.$('[class*="authBox-"] button');
    await acceptInvitation?.click();

    dialog.info("We can't refuse 'Open with Discord', please click 'Cancel' and then click 'Continue on Discord'.");

    await page.waitForSelector('#channels', { visible: true, timeout: 0 });

    // We are on the server page

    await page.addStyleTag({ path: join(__dirname, 'inject', 'tooltip.css') });
    await page.addStyleTag({ path: join(__dirname, 'inject', 'modal.css') });
    await page.addScriptTag({ path: join(__dirname, 'inject', 'modal.js') });
    console.log('Modal helpers are injected');

    // Set Server ID
    const pageUrlArray = page.url().split('/');
    envKeys['DISCORD_SERVER_ID'] = pageUrlArray[pageUrlArray.length - 2];

    // Write to .env files
    writeFileSync(join(__dirname, '..', '..', '.env'), stringify(envKeys));

    // Ask for bot webhook role
    await page.addScriptTag({
        path: join(__dirname, 'inject', 'askBotRoleStep.js'),
    });

    await new Promise<void>(async (resolve) => {
        await page.exposeFunction('onBotPermissionAdded', () => {
            resolve();
        });
    });

    // Set bot command channel
    await page.addScriptTag({
        path: join(__dirname, 'inject', 'textChannelChooserStep.js'),
    });

    await new Promise<void>(async (resolve) => {
        await page.exposeFunction('onTextChannelChosen', (textChannelId: string) => {
            envKeys['DISCORD_BOT_COMMAND_CHANNEL_ID'] = textChannelId;
            resolve();
        });
    });

    // Write to .env files
    writeFileSync(join(__dirname, '..', '..', '.env'), stringify(envKeys));

    // Set bot voice channel
    await page.addScriptTag({
        path: join(__dirname, 'inject', 'voiceChannelChooserStep.js'),
    });

    await new Promise<void>(async (resolve) => {
        await page.exposeFunction('onVoiceChannelChosen', (voiceChannelId: string) => {
            envKeys['DISCORD_VOICE_CHANNEL_ID'] = voiceChannelId;
            resolve();
        });
    });

    // Write to .env files
    writeFileSync(join(__dirname, '..', '..', '.env'), stringify(envKeys));

    // Create webhook
    const serverHeader = await page.$('header[class*="header-"]');
    await serverHeader?.click();

    await page.waitForSelector('#guild-header-popout-settings');

    const serverSettings = await page.$('#guild-header-popout-settings');
    await serverSettings?.click();

    await page.waitForSelector('[aria-controls="INTEGRATIONS-tab"]');

    const serverIntegrationsSettings = await page.$('[aria-controls="INTEGRATIONS-tab"]');
    await serverIntegrationsSettings?.click();

    await page.waitForSelector('[class*="cardPrimaryEditable"]');

    const consultWebhookButton = await page.$(
        '[class*="divider-"] + [role="button"] > [class*="cardPrimaryEditable"] [class*="colorStandard-"]',
    );

    if (consultWebhookButton) {
        await consultWebhookButton.click();

        const createWebhookButton = await page.$('[class*="createButton-"]');
        await createWebhookButton?.click();
    } else {
        const createWebhookButton = await page.$('[class*="divider-"] + [class*="cardPrimaryEditable"] button');
        await createWebhookButton?.click();
    }

    await page.waitForSelector('[class*="copyButton-"]');

    const copyWebhookUrlButton = await page.$('[class*="copyButton-"]');
    await copyWebhookUrlButton?.click();

    const webhookUrl = await page.evaluate(() => navigator.clipboard.readText());
    envKeys['DISCORD_WEBHOOK_URL'] = webhookUrl;

    // Write to .env files
    writeFileSync(join(__dirname, '..', '..', '.env'), stringify(envKeys));

    await browser.close();

    console.log('Done!');
})();
