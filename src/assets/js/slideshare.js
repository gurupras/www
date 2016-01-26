// Disable deck's goto keys
$(document).unbind('keydown.deckgoto');

var socket = io();

$(document).on('deck.change', function(event, from, to) {
	if(from != to) {
		socket.emit('deck-change', {'from': from, 'to': to});
	}
	return false;
});

socket.on('update-deck', function(msg) {
	console.log("update-deck: " + msg.from + " -> " + msg.to);
	var to = msg.to;
	$.deck('go', to);
});

socket.on('log-message', function(msg) {
	console.log("Server sent: " + msg);
});
