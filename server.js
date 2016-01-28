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


function extend(target) {
	var sources = [].slice.call(arguments, 1);
	sources.forEach(function (source) {
		for (var prop in source) {
			target[prop] = source[prop];
		}
	});
	return target;
}

function addNewConnection(socket, profile, isAdmin) {
	connectionCount++;
	connections[socket.id] = extend({}, profile, {'admin' : isAdmin});
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
		// User is sending across his info. Check and tell him if he's admin
		console.log("Received auth0:\n------------------------------------------\n" + msg + "\n------------------------------------------\n");
		var profile = JSON.parse(msg);
		var userType = 'guest';
		if(profile.user_id === 'auth0|56a7efd82118f650176628a3') {
			userType = 'admin';
		}
		addNewConnection(socket, profile, userType === 'admin' ? true : false);
		socket.emit('user-type', userType);
	});

	socket.on('deck-change', function(msg) {
		if(!connections[socket.id]) {
			console.log("warn: This socket has not yet been fully initialized");
			return;
		}
		console.log(connections[socket.id].email + ": deck-change: " + msg.from + ' -> ' + msg.to);
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


