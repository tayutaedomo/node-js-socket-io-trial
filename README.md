# node-js-socket-io-trial
Try socket.io


# Required
- redis-server


# Setup your local
```
$ git clone https://github.com/tayutaedomo/node-js-socket-io-trial.git
$ cd node-js-socket-io-trial
$ npm install
$ env REDIS_URL=redis://localhost:6379
$ npm start
```


# Confirm socket info
## Channels
````
$ redis-cli
> PUBLISH CHANNELS
1) "socket.io#/#"
2) "socket.io-request#/#"
3) "socket.io#/#room-1#"
4) "socket.io-response#/#"
````

## Connected Count
```
$ redis-cli
> PUBSUB NUMSUB "socket.io#/#room-1#"
1) "socket.io#/#room-1#"
2) (integer) 1
```

