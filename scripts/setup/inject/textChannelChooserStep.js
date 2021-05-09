window.openModal(
    'Text Channel',
    undefined,
    'Please select in the tree the text channel where the bot will be attached to.',
    window.closeModal,
);

document.querySelectorAll('a[data-list-item-id^="channels___"]').forEach((node) => {
    // Remove old events
    const nodeClone = node.cloneNode(true);
    node.parentNode.replaceChild(nodeClone, node);

    nodeClone.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const textChannelAttribute = nodeClone.getAttribute('data-list-item-id');
        const textChannelId = textChannelAttribute.replace('channels___', '');
        window.onTextChannelChosen(textChannelId);
    });
});
