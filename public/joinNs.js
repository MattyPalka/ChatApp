function joinNs(endpoint) {
    // check if nsSocket is actually a socket
    if (nsSocket) {
        nsSocket.close()
        //remove the eventListener for submit before added again
        document.querySelector('#user-input').removeEventListener('submit', formSubmission)
    }
    nsSocket = io(`http://localhost:9000${endpoint}`)
    // listen for nsRoomLoad, which is a list of rooms inside a namespace
    nsSocket.on('nsRoomLoad', (nsRooms) => {
        let roomListDiv = document.querySelector(".room-list")
        roomListDiv.innerHTML = ""
        nsRooms.forEach((room) => {
            let glyph = room.privateRoom ? 'lock' : 'globe'
            roomListDiv.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
        })

        //add a click listener to each room
        document.querySelectorAll('.room').forEach((el) => {
            el.addEventListener('click', (e) => {
                joinRoom(e.target.innerText)
            })
        })

        // add room automatically ... first time got here
        const topRoomName = document.querySelector(".room").innerText
        joinRoom(topRoomName)

    })

    nsSocket.on('messageToClients', (msg) => {
        const newMsg = buildHTML(msg)
        document.querySelector("#messages").innerHTML += newMsg
    })

    document.querySelector(".message-form").addEventListener('submit', formSubmission)
}

function formSubmission(event) {
    event.preventDefault()
    const newMessage = document.querySelector("#user-message").value
    nsSocket.emit('newMessageToServer', { text: newMessage })
}

function buildHTML(msg) {
    const convertedTime = new Date(msg.time).toLocaleString()
    const newHTML = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${convertedTime}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>
    `
    return newHTML
}
