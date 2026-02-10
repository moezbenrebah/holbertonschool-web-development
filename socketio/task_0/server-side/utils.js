const { boards, users } = require('./store');

function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function validateTaskInput(data) {
  if (!data.title || typeof data.title !== 'string') {
    return { valid: false, error: 'Title is required' };
  }

  if (data.title.trim().length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }

  if (data.title.length > 100) {
    return { valid: false, error: 'Title must be less than 100 characters' };
  }

  return { valid: true };
}

function findBoard(boardId) {
  return boards.find(b => b.id === boardId);
}

function getTasksForBoard(boardId) {
  const board = findBoard(boardId);
  return board ? board.tasks : [];
}

function getUserById(userId) {
  for (let [socketId, user] of users.entries()) {
    if (user.id === userId) {
      return { ...user, socketId };
    }
  }
  return null;
}

function getOnlineUsers() {
  const userList = [];
  for (let [socketId, user] of users.entries()) {
    userList.push({
      id: user.id,
      username: user.username,
      currentBoard: user.currentBoard
    });
  }
  return userList;
}

const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message, data = {}) => {
    console.error(`[ERROR] ${message}`, data);
  },
  event: (eventName, data = {}) => {
    console.log(`[EVENT] ${eventName}`, data);
  }
};

module.exports = {
  generateId,
  validateTaskInput,
  findBoard,
  getTasksForBoard,
  getUserById,
  getOnlineUsers,
  logger
};
