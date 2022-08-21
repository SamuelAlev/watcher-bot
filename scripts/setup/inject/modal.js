const modal = document.createElement('div');
modal.classList.add('modal', 'hide');

const container = document.createElement('div');
container.classList.add('container');

modal.appendChild(container);
document.body.appendChild(modal);

window.openModal = (title, image, content, onClick) => {
    modal.classList.remove('hide');

    const titleElement = document.createElement('h1');
    titleElement.classList.add('title');
    titleElement.innerText = title;

    let imageElement;
    if (image) {
        imageElement = document.createElement('img');
        imageElement.classList.add('image');
        imageElement.src = image;
    }

    const contentElement = document.createElement('p');
    contentElement.classList.add('content');
    contentElement.innerHTML = content;

    const buttonElement = document.createElement('button');
    buttonElement.classList.add('button');
    buttonElement.innerText = 'Continue';
    buttonElement.onclick = onClick;

    container.appendChild(titleElement);
    image && container.appendChild(imageElement);
    container.appendChild(contentElement);
    container.appendChild(buttonElement);
};

window.closeModal = () => {
    modal.classList.add('hide');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};
