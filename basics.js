// We need http because we don't use Express
const http = require('http')
// We need socket io from npm
const socketio = require('socket.io')

// Make an http server with node
const server = http.createServer((req, res)=>{
    res.end("I'm connected")
})

const io = socketio(server)

io.on('connection', (socket) => {
    //ws.send becomes socket.emit
    socket.emit('welcome', "Welcome to socket io server")
    socket.on('message', (msg)=>{
        console.log(msg)
    })

})

server.listen(8000)