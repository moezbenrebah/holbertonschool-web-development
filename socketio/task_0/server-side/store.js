const users = new Map();

const boards = [
  {
    id: 'dev',
    name: 'Development',
    tasks: [
      {
        id: 'task-1',
        boardId: 'dev',
        title: 'Setup project repository',
        status: 'done',
        createdBy: 'system',
        assignedTo: null,
        createdAt: Date.now()
      },
      {
        id: 'task-2',
        boardId: 'dev',
        title: 'Implement user authentication',
        status: 'in-progress',
        createdBy: 'system',
        assignedTo: null,
        createdAt: Date.now()
      }
    ]
  },
  {
    id: 'mkt',
    name: 'Marketing',
    tasks: [
      {
        id: 'task-3',
        boardId: 'mkt',
        title: 'Create social media campaign',
        status: 'todo',
        createdBy: 'system',
        assignedTo: null,
        createdAt: Date.now()
      }
    ]
  },
  {
    id: 'des',
    name: 'Design',
    tasks: []
  }
];

const tasks = new Map();
boards.forEach(board => {
  board.tasks.forEach(task => {
    tasks.set(task.id, task);
  });
});

const notifications = new Map();

const typingUsers = new Map();

module.exports = {
  users,
  boards,
  tasks,
  notifications,
  typingUsers
};
