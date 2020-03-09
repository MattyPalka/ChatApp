function joinRoom(roomName) {
    // Send this room name to the server
    nsSocket.emit('joinRoom', roomName)

    nsSocket.on('historyCatchUp', (history) => {
        const messagesUl = document.querySelector('#messages')
        messagesUl.innerHTML = ""
        history.forEach((msg)=>{
            const newMsg = buildHTML(msg)
            const currentMessages = messagesUl.innerHTML
            messagesUl.innerHTML = currentMessages + newMsg
        })
        messagesUl.scrollTo(0, messagesUl.scrollHeight)
    })

    nsSocket.on('updateMembers', (numMembers) => {
        //update the room number total once joined
        document.querySelector(".curr-room-num-users").innerHTML = `${numMembers} <span class="glyphicon glyphicon-user"></span>`
        document.querySelector(".curr-room-text").innerText = `${roomName} `
    })

    let searchBox = document.querySelector("#search-box")
    searchBox.addEventListener('input', (event) => {
        let messages = document.querySelectorAll('.message-text')
        messages.forEach((el)=>{
            if(el.innerText.toLowerCase().indexOf(event.target.value.toLowerCase()) === -1){
                //the msg is not in the search box
                el.style.display = 'none'
            } else {
                el.style.display = 'block'
            }
        })
    })
}