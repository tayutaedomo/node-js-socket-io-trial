'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;

/**
 * Express Settings
 */
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/html/index.html');
});

// Refer: https://github.com/heroku-examples/node-socket.io/blob/master/server.js
// const server = express()
//   .use((req, res) => res.sendFile(INDEX) )
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// Refer: https://github.com/snakajima/remoteio/blob/master/nodejs/index.js
// app.get('/', (req, res) => {
//   res.sendFile('index.html', { root: path.join(__dirname, './html') });
// });
// app.get('/html/:filename', (req, res) => {
//   res.sendFile(req.params.filename, { root: path.join(__dirname, './html') });
// });
// app.get('/css/:filename', (req, res) => {
//   res.sendFile(req.params.filename, { root: path.join(__dirname, './css') });
// });
// app.get('/js/:filename', (req, res) => {
//   res.sendFile(req.params.filename, { root: path.join(__dirname, './js') });
// });


/**
 * Server Settings
 */
const server = require('http').createServer(app);

server.listen(PORT, () => {
  console.log(`Listening on ${ PORT }`);
});


/**
 * socket.io Settings
 */
const io = socketIO(server);
const redis = require('socket.io-redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

io.adapter(redis(REDIS_URL));

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('/room/join', function(data) {
    console.log('/room/join', data.name);

    socket.join(data.name); // Join specified room

    io.sockets.adapter.sids[socket.id].ROOM = data.name;  // Store room name

    socket.emit('/room/join/success');
  });

  socket.on('/room/message', function(data) {
    var room = io.sockets.adapter.sids[socket.id].ROOM;

    console.log('message', room, data);

    io.sockets.in(room).emit('/room/message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

setInterval(
  () => io.emit('time', new Date().toTimeString()),
  1000);


//
// See: https://html5experts.jp/mganeko/5349/
//
io.of('/signaling').on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', function() {
    console.log('Client disconnected');

    socket.broadcast.emit('user disconnected');
  });
});

//
// https://html5experts.jp/mganeko/20112/
//
io.of('/signaling_multi').on('connection', function(socket) {
  console.log('Client connected');

  // ---- multi room ----
  socket.on('enter', function(roomname) {
    socket.join(roomname);
    console.log('id=' + socket.id + ' enter room=' + roomname);
    setRoomname(roomname);
  });

  function setRoomname(room) {
    socket.roomname = room;
  }

  function getRoomname() {
    var room = socket.roomname;
    return room;
  }

  function emitMessage(type, message) {
    // ----- multi room ----
    var roomname = getRoomname();

    if (roomname) {
      //console.log('===== message broadcast to room -->' + roomname);
      socket.broadcast.to(roomname).emit(type, message);
    }
    else {
      console.log('===== message broadcast all');
      socket.broadcast.emit(type, message);
    }
  }

  // When a user send a SDP message
  // broadcast to all users in the room
  socket.on('message', function(message) {
    var date = new Date();
    message.from = socket.id;
    //console.log(date + 'id=' + socket.id + ' Received Message: ' + JSON.stringify(message));

    // get send target
    var target = message.sendto;
    if (target) {
      //console.log('===== message emit to -->' + target);
      socket.to(target).emit('message', message);
      return;
    }

    // broadcast in room
    emitMessage('message', message);
  });

  // When the user hangs up
  // broadcast bye signal to all users in the room
  socket.on('disconnect', function() {
    // close user connection
    console.log((new Date()) + ' Peer disconnected. id=' + socket.id);

    // --- emit ----
    emitMessage('user disconnected', {id: socket.id});

    // --- leave room --
    var roomname = getRoomname();
    if (roomname) {
      socket.leave(roomname);
    }
  });
});

