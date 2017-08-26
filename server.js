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


  // See: https://html5experts.jp/mganeko/5349/
  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
    //socket.broadcast.emit('/signaling/message', message);
  });

  // socket.on('disconnect', () => {
  //   console.log('Client disconnected');
  // });

  socket.on('disconnect', function() {
    console.log('Client disconnected');

    socket.broadcast.emit('user disconnected');
    //socket.broadcast.emit('/signaling/user_disconnected');
  });
});

setInterval(
  () => io.emit('time', new Date().toTimeString()),
  1000);

