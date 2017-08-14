var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
var wsURL = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + serverPathUrl + "wamp";

var connection = new autobahn.Connection({
	url: wsURL
});
var mySession;
connection.onopen = function(session, details) {
	session.subscribe('chat', onChatMessage);
	mySession = session;
};
connection.open();

var logDiv = document.getElementById('log');
var msgInput = document.getElementById('msgInput');
msgInput.addEventListener('keypress', function(e) {
	if (e.keyCode == 13) {
		sendMessage();
	}
});
document.getElementById('sendButton').addEventListener('click', function() {
	sendMessage();
});

function onChatMessage(arg, argkw) {
	show(argkw, false);
}

// Send a new chat message
function sendMessage() {
	var value = msgInput.value;
	if (value) {
		var message = {
			text: msgInput.value,
			sentAt: new Date().toLocaleTimeString()
		};

		mySession.publish('chat', null, message);
		show(message, true);
		msgInput.value = '';
	}
}

function show(message, me) {
	var msgAlign = me ? "right" : "left";
	var msgLog = "<div class='blockquote-" + msgAlign + "'>"
	msgLog += message.text + "<br>";
	msgLog += "<span class='time'>" + message.sentAt + "</span></div>"
	
	var old = logDiv.innerHTML;
	logDiv.innerHTML = msgLog + old;
}
