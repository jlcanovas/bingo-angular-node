// I've reused part of the code of the example in C9
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

var games = {};
var sockets = [];

io.on('connection', function (socket) {
    for(var gameId in games) {
        socket.emit("bingoGame", games[gameId]);
    }

    sockets.push(socket);
    
    socket.on("createBingo", function(data) {
        var bingoId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        var newBingo = {
            name : data.name,
            id : bingoId,
            owner : data.owner,
            votes : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            users : []
        };
        games[bingoId] = newBingo;
        broadcast("bingoGame", newBingo);
    });
    
    socket.on("deleteBingo", function(data) {
        var bingoGame = games[data.id];
        if(typeof bingoGame !== "undefined" || bingoGame !== "null") {
            if(data.user == bingoGame.owner) {
                delete games[data.id];
                broadcast("cleanBingoList", null);
                for(var gameId in games) {
                    broadcast("bingoGame", games[gameId]);
                }
            } else {
                console.log("not the owner!");
            }
        }
    });

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });
  });

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    console.log("Broadcasting ", data);
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Bingo server listening at", addr.address + ":" + addr.port);
});
