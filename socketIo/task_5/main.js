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

const boardSelect = document.getElementById('board-select');
const noBoardSelected = document.getElementById('no-board-selected');
const boardContent = document.getElementById('board-content');
const currentBoardName = document.getElementById('current-board-name');

let currentBoard = null;

let typingTimeout = null;
const typingUsers = new Set();
let currentUsers = [];

let currentUserId = null;

const notifications = [];

const notificationBell = document.getElementById('notification-bell');
const notificationBadge = document.getElementById('notification-badge');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationList = document.getElementById('notification-list');

const assignModal = document.getElementById('assign-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalTaskTitle = document.getElementById('modal-task-title');
const userSelectList = document.getElementById('user-select-list');

let currentAssignTaskId = null;

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

            currentUserId = response.userId;
        } else {
            errorMessage.textContent = response.error || 'Failed to set username';
        }
    });
});

socket.on('user_list', (users) => {
    currentUsers = users;
    updateUserList(users);

    if (!assignModal.classList.contains('hidden')) {
        updateAssignModalUserList();
    }
});

function updateUserList(users) {
    userList.innerHTML = '';
    userCount.textContent = users.length;

    users.forEach(user => {
        const li = document.createElement('li');
        const isTyping = typingUsers.has(user.id);

        if (isTyping) {
            li.innerHTML = `${escapeHtml(user.username)} <span class="typing-indicator">(typing...)</span>`;
            li.classList.add('typing');
        } else {
            li.textContent = user.username;
        }

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

socket.on('task_created', (task) => {
    addTaskToDOM(task);
});

function addTaskToDOM(task) {
    noTasks.classList.add('hidden');

    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.taskId = task.id;

    let assignedInfo = '';
    let assignButton = '';

    if (task.assignedToUsername) {
        assignedInfo = `<div class="task-assigned">Assigned to: ${escapeHtml(task.assignedToUsername)}</div>`;
    } else if (task.createdBy === currentUserId || task.createdByUsername === currentUsernameSpan.textContent) {
        assignButton = `
            <div class="task-actions">
                <button class="btn-assign" data-task-id="${task.id}" data-task-title="${escapeHtml(task.title)}">
                    Assign
                </button>
            </div>
        `;
    }

    taskCard.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <span class="task-status ${task.status}">${task.status}</span>
        </div>
        <div class="task-meta">
            Created by ${escapeHtml(task.createdByUsername || task.createdBy)}
        </div>
        ${assignedInfo}
        ${assignButton}
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

boardSelect.addEventListener('change', (e) => {
    const boardId = e.target.value;

    if (!boardId) {
        noBoardSelected.style.display = 'block';
        boardContent.style.display = 'none';
        currentBoard = null;
        return;
    }

    socket.emit('join_board', { boardId });
    currentBoard = boardId;
});

socket.on('board_joined', (data) => {
    noBoardSelected.style.display = 'none';
    boardContent.style.display = 'block';
    currentBoardName.textContent = data.board.name;
    clearTaskList();

    typingUsers.clear();
    updateUserList(currentUsers);

    if (!assignModal.classList.contains('hidden')) {
        updateAssignModalUserList();
    }
});

socket.on('board_tasks', (data) => {
    clearTaskList();

    if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach(task => {
            addTaskToDOM(task);
        });
    }
});

function clearTaskList() {
    taskList.innerHTML = '';
    updateTaskCount();
}

taskTitleInput.addEventListener('input', () => {
    if (!currentBoard) return;

    socket.emit('typing_start', { taskId: 'task-form' });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing_stop', { taskId: 'task-form' });
    }, 3000);
});

taskTitleInput.addEventListener('blur', () => {
    if (!currentBoard) return;

    clearTimeout(typingTimeout);
    socket.emit('typing_stop', { taskId: 'task-form' });
});

socket.on('user_typing', (data) => {
    typingUsers.add(data.userId);
    updateUserList(currentUsers);
});

socket.on('user_stopped_typing', (data) => {
    typingUsers.delete(data.userId);
    updateUserList(currentUsers);
});

notificationBell.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasHidden = notificationDropdown.classList.contains('hidden');

    if (wasHidden) {
        markAllNotificationsAsRead();
    }

    notificationDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!notificationDropdown.classList.contains('hidden') &&
        !notificationDropdown.contains(e.target) &&
        e.target !== notificationBell) {
        notificationDropdown.classList.add('hidden');
    }
});

taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-assign')) {
        const taskId = e.target.dataset.taskId;
        const taskTitle = e.target.dataset.taskTitle;
        openAssignModal(taskId, taskTitle);
    }
});

function openAssignModal(taskId, taskTitle) {
    currentAssignTaskId = taskId;
    modalTaskTitle.textContent = taskTitle;
    updateAssignModalUserList();
    assignModal.classList.remove('hidden');
}

function updateAssignModalUserList() {
    userSelectList.innerHTML = '';

    const usersInBoard = currentUsers.filter(user => {
        const inSameBoard = user.currentBoard === currentBoard;
        const notCurrentUser = user.id !== currentUserId;
        return inSameBoard && notCurrentUser;
    });

    if (usersInBoard.length === 0) {
        userSelectList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No other users in this board</div>';
    } else {
        usersInBoard.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-select-item';
            userItem.textContent = user.username;
            userItem.dataset.userId = user.id;
            userItem.addEventListener('click', () => assignTaskToUser(user.id));
            userSelectList.appendChild(userItem);
        });
    }
}

closeModalBtn.addEventListener('click', () => {
    assignModal.classList.add('hidden');
});

assignModal.addEventListener('click', (e) => {
    if (e.target === assignModal) {
        assignModal.classList.add('hidden');
    }
});

function assignTaskToUser(userId) {
    if (!currentAssignTaskId) return;

    socket.emit('assign_task', {
        taskId: currentAssignTaskId,
        userId: userId
    }, (response) => {
        if (response.success) {
            assignModal.classList.add('hidden');
            currentAssignTaskId = null;
        } else {
            alert('Failed to assign task: ' + (response.error || 'Unknown error'));
        }
    });
}

socket.on('task_assigned', (data) => {
    const taskCard = taskList.querySelector(`[data-task-id="${data.taskId}"]`);
    if (taskCard) {
        let assignedInfo = taskCard.querySelector('.task-assigned');
        if (!assignedInfo) {
            assignedInfo = document.createElement('div');
            assignedInfo.className = 'task-assigned';

            const taskMeta = taskCard.querySelector('.task-meta');
            if (taskMeta) {
                taskMeta.insertAdjacentElement('afterend', assignedInfo);
            }
        }
        assignedInfo.textContent = `Assigned to: ${escapeHtml(data.assignedTo.username)}`;

        const taskActions = taskCard.querySelector('.task-actions');
        if (taskActions) {
            taskActions.remove();
        }
    }
});

socket.on('notification', (notification) => {
    notifications.push(notification);
    updateNotificationUI();
});

socket.on('notifications_list', (notificationsList) => {
    notifications.push(...notificationsList);
    updateNotificationUI();
});

function updateNotificationUI() {
    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
    }

    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="no-notifications">No notifications</div>';
    } else {
        notificationList.innerHTML = '';
        notifications.slice().reverse().forEach(notification => {
            const notifItem = document.createElement('div');
            notifItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notifItem.dataset.notificationId = notification.id;

            const timeAgo = getTimeAgo(notification.createdAt);

            notifItem.innerHTML = `
                <div class="notification-message">${escapeHtml(notification.message)}</div>
                <div class="notification-time">${timeAgo}</div>
            `;

            notifItem.addEventListener('click', () => markNotificationAsRead(notification.id));
            notificationList.appendChild(notifItem);
        });
    }
}

function markNotificationAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.read) return;

    socket.emit('mark_notification_read', { notificationId }, (response) => {
        if (response.success) {
            notification.read = true;
            updateNotificationUI();
        }
    });
}

function markAllNotificationsAsRead() {
    const unreadNotifications = notifications.filter(n => !n.read);

    unreadNotifications.forEach(notification => {
        notification.read = true;
        socket.emit('mark_notification_read', { notificationId: notification.id });
    });

    updateNotificationUI();
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}
