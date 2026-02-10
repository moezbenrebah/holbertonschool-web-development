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

const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title-input');
const taskError = document.getElementById('task-error');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const noTasks = document.getElementById('no-tasks');

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
            mainContent.style.display = 'grid';
            currentUsernameSpan.textContent = username;
            errorMessage.textContent = '';

            socket.emit('join_board', { boardId: 'dev' });
        } else {
            errorMessage.textContent = response.error || 'Failed to set username';
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

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();

    if (!title) {
        taskError.textContent = 'Task title is required';
        return;
    }

    socket.emit('create_task', { title }, (response) => {
        if (response.success) {
            taskTitleInput.value = '';
            taskError.textContent = '';
        } else {
            taskError.textContent = response.error || 'Failed to create task';
        }
    });
});

socket.on('board_tasks', (data) => {
    if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach(task => {
            addTaskToDOM(task);
        });
    }
});

socket.on('task_created', (task) => {
    addTaskToDOM(task);
});

function addTaskToDOM(task) {
    noTasks.classList.add('hidden');

    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.taskId = task.id;

    taskCard.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <span class="task-status ${task.status}">${task.status}</span>
        </div>
        <div class="task-meta">
            Created by ${escapeHtml(task.createdByUsername)}
        </div>
    `;

    taskList.appendChild(taskCard);
    updateTaskCount();
}

function updateTaskCount() {
    const count = taskList.children.length;
    taskCount.textContent = count;

    if (count === 0) {
        noTasks.classList.remove('hidden');
    } else {
        noTasks.classList.add('hidden');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
