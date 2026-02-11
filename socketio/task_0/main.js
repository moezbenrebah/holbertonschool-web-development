// import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');

// const statusIndicator = document.getElementById('status-indicator');
// const statusText = document.getElementById('status-text');
// const socketIdSpan = document.getElementById('socket-id');
// const connectionState = document.getElementById('connection-state');
// const disconnectBtn = document.getElementById('disconnect-btn');
// const reconnectBtn = document.getElementById('reconnect-btn');

// socket.on('connect', () => {

//     statusIndicator.className = 'status-indicator connected';
//     statusText.textContent = 'Connected';
//     socketIdSpan.textContent = socket.id;
//     connectionState.textContent = 'connected';
//     disconnectBtn.disabled = false;
//     reconnectBtn.style.display = 'none';
// });

// socket.on('disconnect', () => {

//     statusIndicator.className = 'status-indicator disconnected';
//     statusText.textContent = 'Disconnected';
//     socketIdSpan.textContent = 'Not connected';
//     connectionState.textContent = 'disconnected';
//     disconnectBtn.disabled = true;
//     reconnectBtn.style.display = 'inline-block';
// });

// disconnectBtn.addEventListener('click', () => {
//     socket.disconnect();
// });

// reconnectBtn.addEventListener('click', () => {
//     socket.connect();
// });
