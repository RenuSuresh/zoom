const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const peerServer = ExpressPeerServer(server, { debug: true });

const io = require('socket.io')(server);

app.set('view engine', 'ejs'); //set the default view engine

app.use(express.static("public"));

app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
  // res.render('room'); //filename that needs to be render
  res.redirect(`/${uuidv4()}`)
})


app.get('/:room', (req, res) => {

  res.render('room', { roomId: req.params.room }); //filename that needs to be render
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
    socket.on("message", message => {
      io.to(roomId).emit('createMessage', message)
    })
  })
})

server.listen(process.env.PORT || 3030);