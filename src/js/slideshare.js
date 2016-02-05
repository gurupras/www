var socket = null;

var shouldSync = true;
var userType = 'guest';

$(document).on('deck.change', function(event, from, to) {
	if(from != to) {
		socket.emit('deck-change', {'from': from, 'to': to});
	}
	return false;
});

var auth0Lock;

function bindSocketEvents() {
	// Bind to deck update
	socket.on('update-deck', function(msg) {
		console.log('update-deck: ' + msg.from + ' -> ' + msg.to);
		var to = msg.to;
		if(shouldSync) {
			// We're *about* to move slides.
			// Since it's a given that we're navigating out of the current slide,
			// it is completely safe to stop *all* animations - regardless of whether
			// they're on the current slide or other slides.
			// So..
			$('iframe').each(function() {
				$(this)[0].pause();
			});
			$.deck('go', to, false);
		}
	});

	// Backend informs us of our user type.
	// We get special privileges if we're the admin!
	socket.on('user-type', function(msg) {
		console.log("User type: " + msg);
		userType = msg;
		if(userType !== 'admin') {
			$('#btn-sync').show();
		}
	});

	// Dummy event in case server wants to send us something to log
	socket.on('log-message', function(msg) {
		console.log('Server sent: ' + msg);
	});

	// Chat message from server
	socket.on('chat-message', function(json) {
		updateChat(json);
	});
}

function updateChat(json) {
		var user = json.name;
		var msg = json.message;
		var text = user + ': ' + msg;
		var li = $('<li/>').addClass('chat-message-li');

		var div = $('<div/>').addClass('chat-message-div');
		div.appendTo(li);

		var imgWrap = $('<div/>').addClass('img-wrap');
		imgWrap.appendTo(div);

		var img = $('<img/>');
		img.attr('src', '/static/test.img');
		img.appendTo(imgWrap);

		var p = $('<p/>');
		// Find length of text and compute number of lines
		// We need this to set line-height
		var lines = text.length / 30;
		p.text(text);
		p.appendTo(div);

		if(json.color) {
			p.css('color', json.color);
		}
		li.appendTo($('#chat-messages'));
}


// Update fields upon successful login
function loginFieldUpdates() {
	var userProfile = JSON.parse(localStorage.getItem('userProfile'));
	$('#login-info').text(userProfile.email);
}

// Update fields upon logout
function logoutFieldUpdates() {
	$('#login-info').text("Hit 'L' to login");
	$('#btn-sync').hide();
}

// Initialize Socket.IO
// Look at server.js for the authentication flow
function initializeSocketIO() {
	socket = io();
	var profile = localStorage.getItem('userProfile');
	var profileJson = JSON.parse(profile);
	var userToken = localStorage.getItem('userToken');
	socket.on('connect', function() {
		socket.on('authenticated', function() {
			// Add stuff to do immediately after authentication
			socket.emit('auth0', profile);
			// This socket has finished the authentication chain.
			// Bind to slideshare events
			bindSocketEvents();

			// Trigger socket.io.initialized
			$(document).trigger('socket.io.initialized');
		});
		socket.emit('authenticate', {'token': userToken});
	});
}

function signin() {
	auth0Lock.show({authParams: {
		scope: 'openid offline_access'
	}}, function(err, profile, token) {
		if (err) {
			// Error callback
			alert('There was an error');
		} else {
			// Success callback

			// Save the tokens
			var profileString = JSON.stringify(profile);
			var profileJson = JSON.parse(profileString);
			localStorage.setItem('userToken', token);
			localStorage.setItem('userProfile', profileString);

			// Update fields
			loginFieldUpdates();

			// Initialize SocketIO
			initializeSocketIO();
		}
	});
}

function signout() {
	localStorage.removeItem('userToken');
	localStorage.removeItem('userProfile');
	// Update fields
	logoutFieldUpdates();
}

function initializeChat() {
	$('#chat-type-box').keydown(function(e) {
		var code = e.which;
		if(code == 13 && !e.shiftKey) {
			var profile = JSON.parse(localStorage.getItem('userProfile'));
			var message = $('#chat-type-box').val();
			var messageJson = $.extend({}, profile, {'message' : message});
			console.log("Requesting server to post message: " + message);
			$('#chat-type-box').val('');
			if(socket) {
				socket.emit('chat-message', messageJson);
			}
			else {
				if(!socket) {
					var json = {
						'name' : 'ops-class.org',
						'message' : 'Please login to use chat',
						'color' : '#D60420'
					};
					updateChat(json);
					return;
				}
			}
		}
	});
}

// Initialize chat on socket.io.initialized
window.onload = initializeChat;

$(document).bind('deck.init', function() {
	// Create Auth0 lock
	auth0Lock = new Auth0Lock('AHf2pl5oLve5NegtSwpLcsrFEzzaFR0I', 'merrimac.auth0.com');
	console.log("Created auth0lock");

	$(document).bind('deck.beforeChange', function() {
		// This event only occurs on:
		// a) admin - always
		// b) guest - if they manually navigate
		if(userType !== 'admin') {
			shouldSync = false;
			$('#btn-sync').prop('disabled', false);
		}
	});

	$('#btn-sync').bind('click', function() {
		// Query backend for current slide if the user clicks on this button
		socket.emit('query', '');
	});

	// Check for authentication
	var profile = JSON.parse(localStorage.getItem('userProfile'));
	if(profile) {
		// TODO: User has authenticated earlier. Get new JWT if needed
		console.log(JSON.stringify(profile));
		// Update fields
		loginFieldUpdates();

		// Initialize SocketIO
		initializeSocketIO();

	}
});

