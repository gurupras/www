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

$(document).bind('deck.init', function() {
	auth0Lock = new Auth0Lock('ID', 'NAMESPACE');
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
});

var userProfile = null;

