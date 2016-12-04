/**
 * socket.io emitter script
 *   Usage: scripts/emitter.js [room name] [send message]
 */
'use strict';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

var emitter = require('socket.io-emitter')(REDIS_URL);
// let redis_options = {
//   host: '',
//   port: '',
// };
// if (/@/.test(REDIS_URL)) {
//   var a = REDIS_URL.split('@');
//
//   var b = a[0].split(':');
//   redis_options.auth_pass = b[1];
//
//   var c = a[1].split(':');
//   redis_options.host = c[0];
//   redis_options.port = c[1];
//
// } else {
//   var a = REDIS_URL.split(':');
//   redis_options.host = a[0];
//   redis_options.port = a[1];
// }
// console.log(redis_options);
// var emitter = require('socket.io-emitter')(redis_options);

if (require.main === module) {
  var room = process.argv.length > 2 ? process.argv[2] : 'room-1';
  var message = process.argv.length > 3 ? process.argv[3] : '';

  //emitter.of('').to(room).emit('other_process', 'broadcasting to room1');

  var payload = {
    'cmd': 'add_message',
    'message': message
  };
  emitter.to(room).emit('/room/message', payload);

  // emitter.to(room).emit('/room/message', payload, function(err) {
  //   if (err) console.error(err);
  //
  //   process.exit(0);
  // });
}

