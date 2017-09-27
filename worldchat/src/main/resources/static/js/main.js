function guid() {
  return 'U' + s4() + s4() + s4() + s4() +
    s4() + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

var user = {
	id: guid(),
	name: "",
	icon: "guy1.png",
	lang: "en"
};

var languageChanged = false, iconChanged = false, nameChanged = false;

var connectedUsers = {};

var shouldScroll = true, shouldTranslate = false;

var digits = "0123456789";

var helpText = "Welcome to WorldChat! Here are some special commands you can send:<br /><br />" + "<table>"
		+ "<tr><td>/help</td><td>- display this help message</td></tr>" + "<tr><td>/sit</td><td>- perform the sit emote</td></tr>"
		+ "<tr><td>/laugh</td><td>- perform the laugh emote</td></tr>" + "<tr><td>/yawn</td><td>- perform the yawn emote</td></tr>"
		+ "<tr><td>/hide</td><td>- perform the hide emote</td></tr>" + "<tr><td>/scream</td><td>- perform the scream emote</td></tr>"
		+ "</table>";

function randBetween(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName() {
	var name = "user";
	for (var i = 0; i < 5; i++) {
		name += digits[randBetween(0, digits.length - 1)];
	}

	return name;
}

function generateIcon() {
	var gender = randBetween(1, 10);
	if (gender <= 5) {
		// male
		return "guy" + randBetween(1, 2) + ".png";
	}
	else {
		// female
		return "girl" + randBetween(1, 2) + ".png";
	}
}

user.name = generateName();
user.icon = generateIcon();

var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
var wsURL = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + serverPathUrl + "wamp";

var currentMsgSubscription;

var wsSession;
var connection = new autobahn.Connection({
	url: wsURL
});
connection.onopen = function(session, details) {
	wsSession = session;
	
	wsSession.subscribe('msg.en', handleMsg).then(function(subscription) {
		currentMsgSubscription = subscription;
	}, function(error) {
		console.log('subscription error: ', error);
	});
	
	wsSession.subscribe('special', function(arg) {
		handleSpecial(arg[0]);
	});
	
	wsSession.subscribe('icon.changed', function(arg) {
		handleChangeIcon(arg[0], arg[1]);
	});
	
	wsSession.subscribe('name.changed', function(arg) {
		handleChangeName(arg[0], arg[1]);
	});

	wsSession.call('connect', [ {id:user.id, name:user.name, icon:user.icon} ]).then(function(result) {
		wsSession.call('list.users').then(function(users) {
			connectedUsers = users;
		});
	});
	
};
connection.open();

/*-----------------------*/

function postChat() {
	var chatInput = document.getElementsByClassName('chat-input')[0];
	if (chatInput.value.trim().length == 0) {
		return;
	}

	var content = chatInput.value.trim();

	var proceed = checkForSpecialMessage(content);
	if (!proceed) {
		chatInput.value = "";
		return;
	}

	var msg = {
		content: content,
		ts: new Date().getTime(),
		userId: user.id,
		lang: user.lang,
		type: (content[0] == "/" ? 'S' : 'N')
	}

	wsSession.call('send', [msg]);
	chatInput.value = "";
}

function checkForSpecialMessage(msg) {
	var trimmed = msg.trim();
	if (trimmed == "/help") {
		var msg = {
			content: helpText,
			ts: new Date().getTime(),
			userId: 'HelpBot'
		}

		updateChatUI(msg);

		return false;
	}

	return true;
}

function handleMsg(arg) {
	updateChatUI(arg[0]);
}


function handleSpecial(msg) {
	generateSpecialMessage('<span style="color: #48b19b">' + msg.name + '</span> ' + msg.emote);
}

function handleChangeIcon(userId, icon) {
	var uiIconList = document.body.querySelectorAll('.user-icon.'+userId);

	for (var i = 0; i < uiIconList.length; i++) {
		uiIconList[i].src = "assets/" + icon;		
	}
	
	wsSession.call('list.users').then(function(users) {
		connectedUsers = users;
	});	
}

function handleChangeName(userId, name) {
	var usernameList = document.body.querySelectorAll('.user-name-display.'+userId);

	for (var i = 0; i < usernameList.length; i++) {
		usernameList[i].textContent = name;
	}

	wsSession.call('list.users').then(function(users) {
		connectedUsers = users;
	});

}

function updateChatUI(msg) {
	var msgUser;
	if (msg.userId === 'HelpBot') {
		msgUser = {
			name: 'HelpBot',
			icon: 'robot.png'
		};
	}
	else {
		msgUser = connectedUsers[msg.userId];
	}
	
	var chatArea = document.getElementsByClassName('chat-area')[0];

	var chatBoxContainer = document.createElement('div');
	chatBoxContainer.className = "chat-box-container";

	var chatBox = document.createElement('div');
	chatBox.className = "chat-box" + ((msgUser.name == user.name) ? " chat-box-own" : "");
	chatBoxContainer.appendChild(chatBox);

	var chatTextBox = document.createElement('div');
	chatTextBox.className = "chat-text-box";
	chatBox.appendChild(chatTextBox);

	var chatMetadataBox = document.createElement('div');
	chatMetadataBox.className = "chat-metadata-box";
	chatTextBox.appendChild(chatMetadataBox);

	var chatTime = document.createElement('p');
	chatTime.className = "chat-time";

	var ts = new Date(msg.ts);
	var timeString = ts.toTimeString();
	chatTime.textContent = ts.toDateString() + " @ " + timeString.substr(0, timeString.indexOf(' '));
	chatMetadataBox.appendChild(chatTime);

	var userNameDisplay = document.createElement('p');
	userNameDisplay.className = "user-name-display " + msgUser.id;
	userNameDisplay.textContent = msgUser.name;
	chatMetadataBox.appendChild(userNameDisplay);

	var chatDivider = document.createElement('hr');
	chatDivider.className = "chat-divider";
	chatMetadataBox.appendChild(chatDivider);

	var chatContentBox = document.createElement('div');
	chatContentBox.className = "chat-content-box";
	chatTextBox.appendChild(chatContentBox);

	var chatContentText = document.createElement('p');
	chatContentText.className = "chat-content-text";
	chatContentText.innerHTML = msg.content;
	chatContentBox.appendChild(chatContentText);

	var userIcon = document.createElement('img');
	userIcon.setAttribute('alt', 'User Icon');
	userIcon.className = "user-icon " + msgUser.id;
	userIcon.src = "assets/" + msgUser.icon;
	chatBox.appendChild(userIcon);

	chatArea.appendChild(chatBoxContainer);

	scrollChat();
}

function scrollChat() {
	var chatArea = document.getElementsByClassName('chat-area')[0];

	var scrollFactor = 10;
	var diff = chatArea.scrollHeight - chatArea.scrollTop;
	if (shouldScroll && diff > 0) {
		chatArea.scrollTop = chatArea.scrollHeight;
	}
}

function checkForSend(e) {
	var keynum;

	if (window.event) { // IE
		keynum = e.keyCode;
	}
	else if (e.which) { // Netscape/Firefox/Opera
		keynum = e.which;
	}

	/* if enter key was pressed */
	if (keynum == 13) {
		shouldScroll = true;
		postChat();
	}
}

function setScroll() {
	var chatArea = document.getElementsByClassName('chat-area')[0];
	var scrollBarHeight = chatArea.scrollHeight * (chatArea.offsetHeight / chatArea.scrollHeight)

	if (chatArea.scrollTop + scrollBarHeight < chatArea.scrollHeight) {
		shouldScroll = false;
	}
	else {
		shouldScroll = true;
	}
}

function generateSpecialMessage(msg) {
	if (msg.indexOf("disconnected") !== -1 || msg.indexOf("connected") !== -1) {
		wsSession.call('list.users').then(function(users) {
			connectedUsers = users;
		});
	}

	var chatArea = document.getElementsByClassName('chat-area')[0];

	var chatBoxContainer = document.createElement('div');
	chatBoxContainer.className = "chat-box-container";

	var specialMessage = document.createElement('p');
	specialMessage.className = "special-message";
	specialMessage.innerHTML = msg;

	chatBoxContainer.appendChild(specialMessage);
	chatArea.appendChild(chatBoxContainer);

	scrollChat();
}

function openSettings() {
	var overlay = document.getElementsByClassName('overlay')[0];
	var settingsWindow = document.getElementsByClassName('settings-window')[0];

	overlay.style.display = "block";
	settingsWindow.style.display = "block";

	document.getElementsByClassName('username-input')[0].value = user.name;
	var iconList = document.getElementsByClassName('icon-list')[0];
	var icons = iconList.querySelectorAll('img');

	selectedIcon = user.icon;

	for (var i = 0; i < icons.length; i++) {
		if (icons[i].getAttribute('data-icon-name') == user.icon) {
			icons[i].parentNode.style.borderColor = "#48b19b";
		}
		else {
			icons[i].parentNode.style.borderColor = "transparent";
		}
	}

	setTimeout(function() {
		overlay.style.opacity = 1;
		settingsWindow.style.opacity = 1;
	}, 0);
}

function selectIcon(elem) {
	var iconList = document.getElementsByClassName('icon-list')[0];
	var icons = iconList.querySelectorAll('img');

	for (var i = 0; i < icons.length; i++) {
		if (icons[i].getAttribute('data-icon-name') == elem.getAttribute('data-icon-name')) {
			icons[i].parentNode.style.borderColor = "#48b19b";
		}
		else {
			icons[i].parentNode.style.borderColor = "transparent";
		}
	}

	selectedIcon = elem.getAttribute('data-icon-name');
}

function selectLanguage(elem) {
	var languageSelect = elem;
	if (elem.value != user.lang) {
		for (var i = 0; i < supportedLanguages.length; i++) {
			if (supportedLanguages[i].language == elem.value) {
				user.lang = supportedLanguages[i].language;
				languageChanged = true;
				break;
			}
		}
	}
}

function applySettings() {
	if (selectedIcon != user.icon) {
		user.icon = selectedIcon;
		iconChanged = true;

		wsSession.publish('icon.changed', [ user.id, user.icon ]);
		handleChangeIcon(user.id, user.icon);
	}

	var username = document.getElementsByClassName('username-input')[0].value;
	if (username != user.name) {
		var errorText = document.getElementsByClassName('error-text')[0];
		
		var usernameAlreadyTaken = false;
		Object.keys(connectedUsers).forEach(function(id) {
			if (username === connectedUsers[id].name) {
				usernameAlreadyTaken = true;
			}
		});
				
		if (usernameAlreadyTaken || username == "HelpBot") {
			errorText.textContent = "- Username is already taken";
			errorText.style.display = "inline";
		}
		else if (username.length < 3) {
			errorText.textContent = "- Username must be at least 3 characters long";
			errorText.style.display = "inline";
		}
		else {
			nameChanged = true;
			user.name = username;
			wsSession.publish('name.changed', [ user.id, user.name ]);
			handleChangeName(user.id, user.name);
			closeSettings();
		}
	}
	else {
		closeSettings();
	}

	if (iconChanged) {
		if (user.icon == "girl1.png" || user.icon == "girl2.png") {
			generateSpecialMessage("You have successfully changed your icon. You are now a pretty girl!")
		}
		else {
			generateSpecialMessage("You have successfully changed your icon. You are now a strapping young lad.");
		}
		iconChanged = false;
	}

	if (nameChanged) {
		generateSpecialMessage("Who once was <span style=\"color: #48b19b;\">" + user.name
				+ "</span> shall now be known to the world as <span style=\"color: #48b19b;\">" + username
				+ "</span>!<br />Go! Embrace your new identity! Everyone is waiting!");
		nameChanged = false;
	}

	if (languageChanged) {
		generateSpecialMessage("You have selected '" + user.lang
				+ "' as your spoken language.<br />All incoming messages will be translated to match your selection.");

		wsSession.unsubscribe(currentMsgSubscription);
		wsSession.subscribe('msg.' + user.lang, handleMsg).then(function(subscription) {
			currentMsgSubscription = subscription;
		}, function(error) {
			console.log('subscription error: ', error);
		});

		languageChanged = false;
	}
}

function closeSettings() {
	var overlay = document.getElementsByClassName('overlay')[0];
	var settingsWindow = document.getElementsByClassName('settings-window')[0];

	var errorText = document.getElementsByClassName('error-text')[0];
	errorText.textContent = "";
	errorText.style.display = "none";
	settingsWindow.style.opacity = 0;
	overlay.style.opacity = 0;

	setTimeout(function() {
		settingsWindow.style.display = "none";
		overlay.style.display = "none";
	}, 350);
}

function generateLanguageSelections() {
	var languageSelect = document.getElementsByClassName('language-select')[0];
	for (var i = 0; i < supportedLanguages.length; i++) {
		var lang = supportedLanguages[i];

		var opt = document.createElement('option');
		opt.setAttribute('value', lang.language);
		if (lang.language == "en")
			opt.setAttribute('selected', 'selected');
		opt.textContent = lang.name;

		languageSelect.appendChild(opt);
	}
}

window.onload = function() {
	generateSpecialMessage("Welcome to WorldChat, <span style=\"color: #48b19b\">" + user.name + "</span>!");

	generateLanguageSelections();
}

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
};
