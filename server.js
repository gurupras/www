var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jwt = require('socketio-jwt');


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});


app.use('/assets', express.static('assets'));
app.use('/slides', express.static('slides'));

var connectionCount = 0;
var connections = {};
var currentDeck = 0;

function addNewConnection(socket, isAdmin) {
	connectionCount++;
	connections[socket.id] = {'admin' : isAdmin};
}

/**
 * Authorization flow:
 * The user performs auth0 login and then establishes the Socket.IO socket.
 * This causes a 'connection' event on the backend which somehow seems to
 * internally emit the 'authenticate' to the client and also handles the
 * response. Finally, the 'authenticated' event seems to be fired to both
 * client and server.
 *
 * In addition to this, we have added the 'auth0' event to the flow through
 * which the client sends profile information to the server
 *
 * (s): Server
 * (c): Client
 *      User login(c) -> io()(c) -> io.on('connection')(s) ---
 *  --> socket.emit('authenticate')(c) -> unsure ---
 *  --> socket.on('authenticated') (c) -> socket.emit('auth0')(c) ---
 *  --> socket.on('auth0')(s) -> socket.emit('user-type') (s) ---
 *  --> socket.on('user-type')(c)
 */

io.on('connection', jwt.authorize({
	secret: Buffer('jvU_-jsvjKmfXyuoTlNeJe-35EZm8ml51-dY8ueG8dfA8O8D_P-Uu3l29464JDMi', 'base64'),
	timeout: 15000 // 15 seconds to send the authentication message
})).on('authenticated', function(socket) {
	console.log('A user connected');

	socket.on('disconnect', function() {
		delete connections[socket];
		connectionCount--;
	});

	socket.on('auth0', function(msg) {
		// User is sending across his info check and tell him if he's admin
		console.log("Received auth0:\n------------------------------------------\n" + msg + "\n------------------------------------------\n");
		var profile = JSON.parse(msg);
		var userType = 'guest';
		if(profile.user_id === 'auth0|56aa61f3fcd3a5454f1dfa05') {
			userType = 'admin';
		}
		addNewConnection(socket, userType === 'admin' ? true : false);
		socket.emit('user-type', userType);
	});

	socket.on('deck-change', function(msg) {
		console.log(socket.id + ": deck-change: " + msg.from + ' -> ' + msg.to);
		if(connections[socket.id].admin === true) {
			// Only admin should broadcast
			console.log('admin deck-change: ' + msg.from + ' -> ' + msg.to);
			// Broadcast it. This does not force-update clients
			// Update on client only happens if they're in sync-mode
			socket.broadcast.emit('update-deck', msg);
			// Update the current deck in backend
			currentDeck = msg.to;
		}
	});
	socket.on('query', function() {
		// User is requesting info on the current slide
		console.log(socket.id + ": query: resp=" + "-1 -> " + currentDeck);
		socket.emit('update-deck', {'from': -1, 'to': currentDeck});
	});
});


http.listen(8080, function(){
	console.log('listening on *:8080');
});


