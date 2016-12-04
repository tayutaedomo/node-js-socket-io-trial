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

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

setInterval(
  () => io.emit('time', new Date().toTimeString()),
  1000);

