const onPermissionPopupConfirm = () => {
    window.onBotPermissionAdded();
    window.closeModal();
};

window.openModal(
    'Bot permission',
    'https://raw.githubusercontent.com/SamuelAlev/watcher-bot/main/src/asset/bot-permissions-webhook.png',
    '<b>You can now open the Discord app if you want or use the web app.</b><br><br>The bot doesn\'t have any permissions yet, please create a role where the bot can "Manage webhooks" and assign it to the bot.',
    onPermissionPopupConfirm,
);
