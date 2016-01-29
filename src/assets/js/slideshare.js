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
}

// Update fields upon successful login
function loginFieldUpdates() {
	var userProfile = JSON.parse(localStorage.getItem('userProfile'));
	$('#login-info').attr('value', userProfile.email);
}

// Update fields upon logout
function logoutFieldUpdates() {
	$('#login-info').attr('value', "Hit 'L' to login");
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

