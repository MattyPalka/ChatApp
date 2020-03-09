const express = require('express')
const app = express()
const socketio = require('socket.io')

let namespaces = require('./data/namespaces')

// use express for static webpages stored in public dir
app.use(express.static(__dirname + '/public'))

// create express server, and pass it to socketio
const expressServer = app.listen(9000)
const io = socketio(expressServer)

//connect to root namespace '/'
io.on('connection', (socket) => {
    //build an array to send back with img and endpoint for each namespace
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })
    // send the nsData back to client. Need to use socket, not io, because we want it to go
    // to just this client
    socket.emit('nsList', nsData)
})

//loop through namespaces and listen for a connection
namespaces.forEach((namespace) => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        const username = nsSocket.handshake.query.username
        // a socket has connected to one of the chatgroup namespaces
        // send that namespaces group info back
        nsSocket.emit('nsRoomLoad', namespace.rooms)
        nsSocket.on('joinRoom', (roomToJoin) => {
            // leave previous rooms before joining new one
            const roomToLeave = Object.keys(nsSocket.rooms)[1]
            nsSocket.leave(roomToLeave)
            updateUsersInRoom(namespace, roomToLeave)
            nsSocket.join(roomToJoin)

            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin
            })

            nsSocket.emit('historyCatchUp', nsRoom.history)

            updateUsersInRoom(namespace, roomToJoin)

        })
        nsSocket.on('newMessageToServer', (msg) => {
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: username,
                avatar: "https://via.placeholder.com/30"
            }
            // send that message to all the sockets that are in the room that this socket is in
            // the user will be in the 2nd room in the object list
            // this is because the socket always joins its own room on the connection
            const roomTitle = Object.keys(nsSocket.rooms)[1]

            //we need to find the room object for this room
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle
            })
            nsRoom.addMessage(fullMsg)

            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg)
        })
    })
})

function updateUsersInRoom(namespace, roomTitle) {
    //send back the number of users in this room to all sockets connected to this room
    io.of(namespace.endpoint).in(roomTitle).clients((err, clients) => {
        io.of(namespace.endpoint).in(roomTitle).emit('updateMembers', clients.length)
    })
}