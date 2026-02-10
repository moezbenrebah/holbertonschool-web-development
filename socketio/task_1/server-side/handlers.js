const {
  users,
  tasks,
  notifications,
  typingUsers
} = require('./store');

const {
  generateId,
  validateTaskInput,
  findBoard,
  getTasksForBoard,
  getUserById,
  getOnlineUsers,
  logger
} = require('./utils');

function handleConnection(socket, io) {
  logger.info('New connection', { socketId: socket.id });
  socket.emit('connection_success', { socketId: socket.id });
}

function handleDisconnect(socket, io) {
  const user = users.get(socket.id);

  if (user) {
    logger.info('User disconnected', { userId: user.id, username: user.username });

    if (user.currentBoard) {
      socket.leave(user.currentBoard);
    }

    users.delete(socket.id);

    io.emit('user_left', {
      userId: user.id,
      username: user.username
    });

    io.emit('user_list', getOnlineUsers());
  }
}

function handleSetUsername(socket, io, data, callback) {
  logger.event('set_username', data);

  if (!data.username || typeof data.username !== 'string' || data.username.trim() === '') {
    const error = { success: false, error: 'Username is required' };
    if (callback) callback(error);
    return;
  }

  const username = data.username.trim();
  const userId = generateId('user');

  const existingUser = Array.from(users.values()).find(u => u.username === username);
  if (existingUser) {
    return callback({ success: false, error: 'Username already taken' });
  }

  users.set(socket.id, {
    id: userId,
    username: username,
    currentBoard: null,
    connectedAt: Date.now()
  });

  notifications.set(userId, []);

  logger.info('User registered', { userId, username });

  const response = {
    success: true,
    userId: userId,
    username: username
  };
  if (callback) callback(response);

  const userNotifications = notifications.get(userId) || [];
  if (userNotifications.length > 0) {
    socket.emit('notifications_list', userNotifications);
  }

  io.emit('user_joined', {
    userId: userId,
    username: username
  });

  io.emit('user_list', getOnlineUsers());
}

function handleJoinBoard(socket, io, data) {
  logger.event('join_board', data);

  const user = users.get(socket.id);
  if (!user) {
    socket.emit('error', { error: 'User not found' });
    return;
  }

  const board = findBoard(data.boardId);
  if (!board) {
    socket.emit('error', { error: 'Board not found' });
    return;
  }

  if (user.currentBoard) {
    socket.leave(user.currentBoard);
    logger.info('User left board', { userId: user.id, boardId: user.currentBoard });
  }

  socket.join(data.boardId);
  user.currentBoard = data.boardId;

  logger.info('User joined board', { userId: user.id, boardId: data.boardId });

  socket.emit('board_joined', {
    board: {
      id: board.id,
      name: board.name
    }
  });

  socket.emit('board_tasks', {
    boardId: board.id,
    tasks: getTasksForBoard(data.boardId)
  });

  socket.to(data.boardId).emit('user_joined_board', {
    userId: user.id,
    username: user.username,
    boardId: data.boardId
  });

  io.emit('user_list', getOnlineUsers());
}

function handleCreateTask(socket, io, data, callback) {
  logger.event('create_task', data);

  const user = users.get(socket.id);
  if (!user) {
    const error = { success: false, error: 'User not found' };
    if (callback) callback(error);
    return;
  }

  if (!user.currentBoard) {
    const error = { success: false, error: 'You must join a board first' };
    if (callback) callback(error);
    return;
  }

  const validation = validateTaskInput({
    title: data.title,
    boardId: user.currentBoard
  });

  if (!validation.valid) {
    const error = { success: false, error: validation.error };
    if (callback) callback(error);
    return;
  }

  const taskId = generateId('task');
  const task = {
    id: taskId,
    boardId: user.currentBoard,
    title: data.title.trim(),
    status: 'todo',
    createdBy: user.id,
    createdByUsername: user.username,
    assignedTo: null,
    createdAt: Date.now()
  };

  tasks.set(taskId, task);

  const board = findBoard(user.currentBoard);
  board.tasks.push(task);

  logger.info('Task created', { taskId, userId: user.id, boardId: user.currentBoard });

  if (callback) {
    callback({ success: true, taskId: taskId, task: task });
  }

  io.to(user.currentBoard).emit('task_created', task);
}

function handleUpdateTaskStatus(socket, io, data) {
  logger.event('update_task_status', data);

  const user = users.get(socket.id);
  if (!user) {
    socket.emit('error', { error: 'User not found' });
    return;
  }

  const task = tasks.get(data.taskId);
  if (!task) {
    socket.emit('error', { error: 'Task not found' });
    return;
  }

  if (task.boardId !== user.currentBoard) {
    socket.emit('error', { error: 'You are not in the correct board' });
    return;
  }

  const validStatuses = ['todo', 'in-progress', 'done'];
  if (!validStatuses.includes(data.status)) {
    socket.emit('error', { error: 'Invalid status' });
    return;
  }

  task.status = data.status;
  task.updatedAt = Date.now();

  logger.info('Task updated', { taskId: task.id, newStatus: data.status });

  io.to(task.boardId).emit('task_updated', {
    taskId: task.id,
    status: task.status,
    updatedAt: task.updatedAt
  });
}

function handleTypingStart(socket, io, data) {
  const user = users.get(socket.id);
  if (!user || !user.currentBoard) return;

  if (!typingUsers.has(data.taskId)) {
    typingUsers.set(data.taskId, new Set());
  }
  typingUsers.get(data.taskId).add(user.id);

  logger.event('typing_start', { userId: user.id, taskId: data.taskId });

  socket.to(user.currentBoard).emit('user_typing', {
    taskId: data.taskId,
    userId: user.id,
    username: user.username
  });

  setTimeout(() => {
    const typingSet = typingUsers.get(data.taskId);
    if (typingSet) {
      typingSet.delete(user.id);
      if (typingSet.size === 0) {
        typingUsers.delete(data.taskId);
      }
    }
  }, 3000);
}

function handleTypingStop(socket, io, data) {
  const user = users.get(socket.id);
  if (!user || !user.currentBoard) return;

  const typingSet = typingUsers.get(data.taskId);
  if (typingSet) {
    typingSet.delete(user.id);
    if (typingSet.size === 0) {
      typingUsers.delete(data.taskId);
    }
  }

  logger.event('typing_stop', { userId: user.id, taskId: data.taskId });

  socket.to(user.currentBoard).emit('user_stopped_typing', {
    taskId: data.taskId,
    userId: user.id,
    username: user.username
  });
}

function handleAssignTask(socket, io, data, callback) {
  logger.event('assign_task', data);

  const user = users.get(socket.id);
  if (!user) {
    const error = { success: false, error: 'User not found' };
    if (callback) callback(error);
    return;
  }

  const task = tasks.get(data.taskId);
  if (!task) {
    const error = { success: false, error: 'Task not found' };
    if (callback) callback(error);
    return;
  }

  if (task.boardId !== user.currentBoard) {
    const error = { success: false, error: 'You are not in the correct board' };
    if (callback) callback(error);
    return;
  }

  const assignee = getUserById(data.userId);
  if (!assignee) {
    const error = { success: false, error: 'Assignee not found or offline' };
    if (callback) callback(error);
    return;
  }

  task.assignedTo = assignee.id;
  task.assignedToUsername = assignee.username;
  task.updatedAt = Date.now();

  logger.info('Task assigned', {
    taskId: task.id,
    assignedTo: assignee.id,
    assignedBy: user.id
  });

  const userNotifications = notifications.get(assignee.id);
  const notificationId = generateId('notif');
  const notification = {
    id: notificationId,
    userId: assignee.id,
    type: 'assignment',
    message: `You were assigned to "${task.title}"`,
    taskId: task.id,
    read: false,
    createdAt: Date.now()
  };
  userNotifications.push(notification);

  if (callback) {
    callback({
      success: true,
      task: task,
      assignee: {
        id: assignee.id,
        username: assignee.username
      }
    });
  }

  io.to(task.boardId).emit('task_assigned', {
    taskId: task.id,
    assignedTo: {
      id: assignee.id,
      username: assignee.username
    },
    updatedAt: task.updatedAt
  });

  io.to(assignee.socketId).emit('notification', notification);
}

function handleMarkNotificationRead(socket, io, data, callback) {
  logger.event('mark_notification_read', data);

  const user = users.get(socket.id);
  if (!user) {
    const error = { success: false, error: 'User not found' };
    if (callback) callback(error);
    return;
  }

  const userNotifications = notifications.get(user.id);
  if (!userNotifications) {
    const error = { success: false, error: 'No notifications found' };
    if (callback) callback(error);
    return;
  }

  const notification = userNotifications.find(n => n.id === data.notificationId);
  if (!notification) {
    const error = { success: false, error: 'Notification not found' };
    if (callback) callback(error);
    return;
  }

  notification.read = true;

  logger.info('Notification marked as read', {
    notificationId: notification.id,
    userId: user.id
  });

  if (callback) {
    callback({ success: true });
  }
}

module.exports = {
  handleConnection,
  handleDisconnect,
  handleSetUsername,
  handleJoinBoard,
  handleCreateTask,
  handleUpdateTaskStatus,
  handleTypingStart,
  handleTypingStop,
  handleAssignTask,
  handleMarkNotificationRead
};
