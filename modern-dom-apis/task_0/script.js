const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const totalCountSpan = document.querySelector('#total-count');
const completedCountSpan = document.querySelector('#completed-count');

let todos = [];

const STORAGE_KEY = 'todos_task0';

function init() {
    renderTodos();
    todoForm.addEventListener('submit', handleAddTodo);
}

function handleAddTodo(event) {
    event.preventDefault();

    const text = todoInput.value.trim();
    if (text === '') return;

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(todo);
    renderTodos();

    todoInput.value = '';
    todoInput.focus();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
    }
}

function renderTodos() {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });

    updateStats();
}

function createTodoElement(todo) {
    const liElement = document.createElement('li');
    liElement.className = 'todo-item';
    if (todo.completed) {
        liElement.classList.add('completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    liElement.appendChild(checkbox);
    liElement.appendChild(span);
    liElement.appendChild(deleteBtn);

    return liElement;
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    totalCountSpan.textContent = total;
    completedCountSpan.textContent = completed;
}

init();
