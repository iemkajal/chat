const socket = io()
let name;
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message__area')
let typingIndicator = document.querySelector('.typing-indicator')

do {
    name = prompt('Please enter your name: ')
} while(!name)

// Notify server when user connects
socket.emit('new-user', name)

textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage(e.target.value)
    }
})

textarea.addEventListener('input', () => {
    socket.emit('typing', { user: name })
})

function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString()
    }
    // Append 
    appendMessage(msg, 'outgoing')
    textarea.value = ''
    scrollToBottom()

    // Send to server 
    socket.emit('message', msg)
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div')
    let className = type
    mainDiv.classList.add(className, 'message')

    let markup = `
        <h4>${msg.user} <span class="timestamp">${msg.timestamp}</span></h4>
        <p>${msg.message}</p>
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

// Receive messages 
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming')
    scrollToBottom()
    typingIndicator.innerText = '' // Clear typing indicator when a message is received
})

// Show typing indicator
socket.on('typing', (data) => {
    typingIndicator.innerText = `${data.user} is typing...`
    setTimeout(() => {
        typingIndicator.innerText = ''
    }, 3000)
})

// Update online users
socket.on('user-connected', (userName) => {
    let mainDiv = document.createElement('div')
    mainDiv.classList.add('status')
    mainDiv.innerText = `${userName} joined the chat`
    messageArea.appendChild(mainDiv)
    scrollToBottom()
})

socket.on('user-disconnected', (userName) => {
    let mainDiv = document.createElement('div')
    mainDiv.classList.add('status')
    mainDiv.innerText = `${userName} left the chat`
    messageArea.appendChild(mainDiv)
    scrollToBottom()
})

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}
