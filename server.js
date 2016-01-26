var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});


app.use('/assets', express.static('assets'));
app.use('/slides', express.static('slides'));

var connectionCount = 0;
var connections = {};
var currentDeck = 0;

function addNewConnection(socket) {
	connectionCount++;
	if(connectionCount == 1) {
		connections[socket.id] = {'admin': true};
		socket.emit('log-message', "You are admin");
		console.log(socket.id + ": admin");
	}
	else {
		connections[socket.id] = {'admin': false};
		socket.emit('log-message', "You are: guest");
		console.log(socket.id + ": guest");
	}
}

io.on('connection', function(socket) {
	addNewConnection(socket);
	console.log('A user connected');

	socket.on('disconnect', function() {
		delete connections[socket];
		connectionCount--;
	});

	socket.on('deck-change', function(msg) {
		console.log(socket.id + ": deck-change: " + msg.from + ' -> ' + msg.to);
		if(connections[socket.id].admin === true) {
			// Only admin should broadcast
			console.log('admin deck-change: ' + msg.from + ' -> ' + msg.to);
			socket.broadcast.emit('update-deck', msg);
			currentDeck = msg.to;
		}
	});
	socket.on('query', function() {
		socket.emit({'from': -1, 'to': currentDeck});
	});
});


http.listen(8080, function(){
	console.log('listening on *:8080');
});


