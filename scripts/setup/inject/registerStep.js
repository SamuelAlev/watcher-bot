const emailTooltip = document.createElement('p');
emailTooltip.innerHTML = 'This field will be autosaved.<br>It is recommended to use a throwback mail address.';
emailTooltip.classList.add('tooltip');

document.body.appendChild(emailTooltip);

const passwordTooltip = document.createElement('p');
passwordTooltip.innerHTML = "This field will be autosaved.<br>Please don't use one of your passwords.";
passwordTooltip.classList.add('tooltip');

document.body.appendChild(passwordTooltip);

const emailInput = document.querySelector('[name="email"]');
emailInput.style.border = '2px solid #10B981';

Popper.createPopper(emailInput, emailTooltip, {
    placement: 'right',
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 8],
            },
        },
    ],
});

emailInput.addEventListener('input', (event) => {
    window.onEmailInput(event.target.value);
});

const passwordInput = document.querySelector('[name="password"]');
passwordInput.style.border = '2px solid #10B981';

Popper.createPopper(passwordInput, passwordTooltip, {
    placement: 'right',
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 8],
            },
        },
    ],
});

passwordInput.addEventListener('input', (event) => {
    window.onPasswordInput(event.target.value);
});
