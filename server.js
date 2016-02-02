var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jwt = require('socketio-jwt');
var config = require('config');

var client_secret = config.get('client_secret');
var admin_id = config.get('admin_id');

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
	secret: Buffer(client_secret, 'base64'),
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
		if(profile.user_id === admin_id) {
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
		console.log(connections[socket.id].email + ": query: resp=" + "-1 -> " + currentDeck);
		socket.emit('update-deck', {'from': -1, 'to': currentDeck});
	});

	socket.on('chat-message', function(json) {
		var backendUserId = connections[socket.id].email;
		var clientUserId = json.email;
		var message;
		// Validate that this client has authorization to post a message
		if(backendUserId !== clientUserId) {
			if(!clientUserId) {
				// Either logged out, or never logged in
				console.log("Client requesting to post: '" + json.message + "' when he is not logged in");
				message = {'name' : 'ops-class.org', 'message' : 'Please log in to use chat', 'color' : '#D60420'};
				socket.emit('chat-message', message);
			}
			else {
				// Client has an ID but it doesn't match what the server has stored for this client
				console.log('WARNING: Client ID != Server ID (' + clientUserId + ' != ' + backendUserId + ')');
			}
		}
		else {
			// Broadcast it
			console.log(connections[socket.id].email + ": " + json.message);
			message = {'name' : json.nickname, 'message' : json.message};
			io.emit('chat-message', message);
		}
	});
});


http.listen(8080, function(){
	console.log('listening on *:8080');
});


