window.openModal(
    'Voice Channel',
    undefined,
    'Please select in the tree the voice channel where the bot will be attached to.',
    window.closeModal,
);

document.querySelectorAll('a[data-list-item-id^="channels___"]').forEach((node) => {
    // Remove old events
    const nodeClone = node.cloneNode(true);
    node.parentNode.replaceChild(nodeClone, node);

    nodeClone.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const voiceChannelAttribute = nodeClone.getAttribute('data-list-item-id');
        const voiceChannelId = voiceChannelAttribute.replace('channels___', '');
        window.onVoiceChannelChosen(voiceChannelId);

        voiceChannelsTooltip.parentElement.removeChild(voiceChannelsTooltip);
    });
});
