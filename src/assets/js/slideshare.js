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
	socket.on('update-deck', function(msg) {
		console.log('update-deck: ' + msg.from + ' -> ' + msg.to);
		var to = msg.to;
		if(shouldSync) {
			$.deck('go', to, false);
		}
	});

	socket.on('user-type', function(msg) {
		console.log("User type: " + msg);
		userType = msg;
		if(userType !== 'admin') {
			$('#btn-sync').show();
		}
	});

	socket.on('log-message', function(msg) {
		console.log('Server sent: ' + msg);
	});
}

function loginFieldUpdates() {
	var userProfile = JSON.parse(localStorage.getItem('userProfile'));
	$('#login-info').attr('value', userProfile.email);
}

function logoutFieldUpdates() {
	$('#login-info').attr('value', "Hit 'L' to login");
	$('#btn-sync').hide();
}

function initializeSocketIO() {
	socket = io();
	var profile = localStorage.getItem('userProfile');
	var profileJson = JSON.parse(profile);
	var userToken = localStorage.getItem('userToken');
	socket.on('connect', function() {
		socket.on('authenticated', function() {
			// Add stuff to do immediately after authentication
			socket.emit('auth0', profile);
		});
		socket.emit('authenticate', {'token': userToken});
	});
	// This socket has finished the authentication chain.
	// Bind to slideshare events
	bindSocketEvents();
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

			// Save the JWT token.
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


$(document).bind('deck.init', function() {
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


