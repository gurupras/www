var socket = io();

var shouldSync = true;
var userType = 'guest';

$(document).on('deck.change', function(event, from, to) {
	if(from != to) {
		socket.emit('deck-change', {'from': from, 'to': to});
	}
	return false;
});

socket.on('update-deck', function(msg) {
	console.log('update-deck: ' + msg.from + ' -> ' + msg.to);
	var to = msg.to;
	if(shouldSync) {
		$.deck('go', to, false);
	}
});

socket.on('user-type', function(msg) {
	userType = msg;
	if(userType === 'admin') {
		$('#btn-sync').hide();
	}
});

socket.on('log-message', function(msg) {
	console.log('Server sent: ' + msg);
});

var auth0Lock;

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
			localStorage.setItem('userToken', token);
			localStorage.setItem('userProfile', JSON.stringify(profile));
			$('#btn-login').hide();
			$('#btn-logout').attr('value', profile.email).show();
		}
	});
}

function signout() {
	localStorage.removeItem('userToken');
	localStorage.removeItem('userProfile');
}


$(document).bind('deck.init', function() {
	auth0Lock = new Auth0Lock('AHf2pl5oLve5NegtSwpLcsrFEzzaFR0I', 'merrimac.auth0.com');
	console.log("Created auth0lock");

	if(userType === 'admin') {
		// Remove sync button and do not change 'shouldSync'
		$('#btn-sync').hide();
	}

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
		// User has authenticated earlier. Get new JWT if needed
		console.log(JSON.stringify(profile));
		$('#btn-login').hide();
		$('#btn-logout').attr('value', profile.email).show();
	}
});


