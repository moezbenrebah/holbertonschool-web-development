const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { boards } = require('./store');
const { logger } = require('./utils');
const {
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
} = require('./handlers');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Live Task Board Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/boards', (req, res) => {
  const boardList = boards.map(board => ({
    id: board.id,
    name: board.name,
    taskCount: board.tasks.length
  }));
  res.json({ boards: boardList });
});

io.on('connection', (socket) => {
  handleConnection(socket, io);

  socket.on('set_username', (data, callback) => {
    handleSetUsername(socket, io, data, callback);
  });

  socket.on('join_board', (data) => {
    handleJoinBoard(socket, io, data);
  });

  socket.on('create_task', (data, callback) => {
    handleCreateTask(socket, io, data, callback);
  });

  socket.on('update_task_status', (data) => {
    handleUpdateTaskStatus(socket, io, data);
  });

  socket.on('typing_start', (data) => {
    handleTypingStart(socket, io, data);
  });

  socket.on('typing_stop', (data) => {
    handleTypingStop(socket, io, data);
  });

  socket.on('assign_task', (data, callback) => {
    handleAssignTask(socket, io, data, callback);
  });

  socket.on('mark_notification_read', (data, callback) => {
    handleMarkNotificationRead(socket, io, data, callback);
  });

  socket.on('disconnect', () => {
    handleDisconnect(socket, io);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`HTTP: http://localhost:${PORT}`);
  logger.info(`Socket.IO: ws://localhost:${PORT}`);
  logger.info(`Available boards: ${boards.map(b => b.name).join(', ')}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
