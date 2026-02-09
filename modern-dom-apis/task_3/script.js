const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const dropZones = document.querySelectorAll('.drop-zone');

let tasks = [];

function init() {
    renderAllColumns();
    setupEventListeners();
}

function setupEventListeners() {
    taskForm.addEventListener('submit', handleAddTask);

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

function handleAddTask(event) {
    event.preventDefault();

    const text = taskInput.value.trim();
    if (!text) return;

    const task = {
        id: Date.now(),
        text: text,
        column: 'todo',
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    renderAllColumns();

    taskInput.value = '';
    taskInput.focus();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderAllColumns();
}

function handleDragStart(event) {
    const taskCard = event.target;
    const taskId = taskCard.dataset.taskId;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);

    taskCard.classList.add('dragging');
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const dropZone = event.currentTarget;
    dropZone.classList.add('drag-over');
}

function handleDragLeave(event) {
    const dropZone = event.currentTarget;
    dropZone.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();

    const dropZone = event.currentTarget;
    dropZone.classList.remove('drag-over');

    const taskId = parseInt(event.dataTransfer.getData('text/plain'));
    const newColumn = dropZone.dataset.column;

    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.column = newColumn;
        renderAllColumns();
    }
}

function renderAllColumns() {
    const columns = ['todo', 'in-progress', 'done'];

    columns.forEach(columnName => {
        const dropZone = document.querySelector(`.drop-zone[data-column="${columnName}"]`);
        const columnTasks = tasks.filter(task => task.column === columnName);

        dropZone.innerHTML = '';

        columnTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            dropZone.appendChild(taskCard);
        });

        updateColumnCount(columnName, columnTasks.length);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;

    const date = new Date(task.createdAt).toLocaleDateString();

    card.innerHTML = `
        <div class="task-content">
            <div class="task-info">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-date">${date}</div>
            </div>
            <button class="btn-delete" data-id="${task.id}">×</button>
        </div>
    `;

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    return card;
}

function updateColumnCount(columnName, count) {
    const countSpan = document.querySelector(`#${columnName}-count`);
    if (countSpan) {
        countSpan.textContent = count;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
