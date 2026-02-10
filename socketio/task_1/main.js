import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const usernameFormContainer = document.getElementById('username-form-container');
const mainContent = document.getElementById('main-content');
const currentUsernameSpan = document.getElementById('current-username');
const userList = document.getElementById('user-list');
const userCount = document.getElementById('user-count');
const errorMessage = document.getElementById('error-message');

socket.on('connect', () => {
    statusIndicator.className = 'status-indicator connected';
    statusText.textContent = 'Connected';
});

socket.on('disconnect', () => {
    statusIndicator.className = 'status-indicator disconnected';
    statusText.textContent = 'Disconnected';
});

usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        errorMessage.textContent = 'Username is required';
        return;
    }

    socket.emit('set_username', { username }, (response) => {
        if (response.success) {
            usernameFormContainer.style.display = 'none';
            mainContent.style.display = 'block';
            currentUsernameSpan.textContent = username;
            errorMessage.textContent = '';
        } else {
            errorMessage.textContent = response.error || 'Failed to set username';
            console.error('Failed to set username:', response.error);
        }
    });
});

socket.on('user_list', (users) => {
    updateUserList(users);
});

function updateUserList(users) {
    userList.innerHTML = '';
    userCount.textContent = users.length;

    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.username;
        li.dataset.userId = user.id;
        userList.appendChild(li);
    });
}
