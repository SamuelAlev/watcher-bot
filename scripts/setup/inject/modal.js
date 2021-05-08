const modal = document.createElement('div');
modal.classList.add('modal', 'hide');

const container = document.createElement('div');
container.classList.add('container');

modal.appendChild(container);
document.body.appendChild(modal);

window.openModal = (title, image, content, onClick) => {
    modal.classList.remove('hide');

    const h1 = document.createElement('h1');
    h1.classList.add('title');
    h1.innerText = title;

    let img;
    if (image) {
        img = document.createElement('img');
        img.classList.add('image');
        img.src = image;
    }

    const p = document.createElement('p');
    p.classList.add('content');
    p.innerHTML = content;

    const button = document.createElement('button');
    button.classList.add('button');
    button.innerText = 'Continue';
    button.onclick = onClick;

    container.appendChild(h1);
    image && container.appendChild(img);
    container.appendChild(p);
    container.appendChild(button);
};

window.closeModal = () => {
    modal.classList.add('hide');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};
