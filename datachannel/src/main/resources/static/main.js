const serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
const wsURL = (window.location.protocol == 'https:' ? 'wss://' : 'ws://') + window.location.host + serverPathUrl + 'wamp';

const connection = new autobahn.Connection({
	url: wsURL
});

const peers = new Map();

const nodes = new vis.DataSet();
const edges = new vis.DataSet();

const container = document.getElementById('peers');
const network = new vis.Network(container, {nodes, edges}, {});

const messageInputField = document.getElementById('messageTa');
const outputDiv = document.getElementById('output');

messageInputField.addEventListener('keypress', event => {
	if (event.keyCode == 13) {
		sendP2PMessage(messageInputField.value);
		messageInputField.value = '';
	}
});

document.getElementById('sendButton').addEventListener('click', event => {	
	sendP2PMessage(messageInputField.value);
	messageInputField.value = '';
});

let wampSession;

connection.onopen = (session, details) => {	
	wampSession = session;	
	
	nodes.add({id:wampSession.id, label:wampSession.id, color:{background:'#C3E186'}});
	
	document.getElementById('wampSessionIdOutput').innerText = wampSession.id;
	
	wampSession.subscribe('peer.connected', peerConnected);
	wampSession.subscribe('peer.disconnected', peerDisconnected); 
	wampSession.publish('peer.connected', [wampSession.id]);
	
	wampSession.subscribe('offer', offerReceived);
	wampSession.subscribe('answer', answerReceived);
	wampSession.subscribe('ice', iceReceived);
};	

connection.onclose = (reason, details) => {
    if (wampSession.id) {
    	nodes.remove(wampSession.id);
    }
};

connection.open();

const configuration = {
  iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }] 
}; 
 
function peerConnected(arg) {
	const peerKey = arg[0];	
	
	const rtcPeerConnection = new RTCPeerConnection(configuration);
	rtcPeerConnection.onicecandidate = onIceCandidate.bind(rtcPeerConnection, peerKey);
	
	const dataChannel = rtcPeerConnection.createDataChannel("dataChannel");
	dataChannel.onopen = handleChannelStatusChange.bind(dataChannel, peerKey);
	dataChannel.onclose = handleChannelStatusChange.bind(dataChannel, peerKey);
	dataChannel.onmessage = onDataChannelMessage.bind(dataChannel, peerKey);
		
	rtcPeerConnection.createOffer()
	  .then(offer => rtcPeerConnection.setLocalDescription(offer))
	  .then(() => wampSession.publish('offer', [wampSession.id, rtcPeerConnection.localDescription], {}, {eligible: [peerKey]}))
	  .catch(reason => console.log(reason));
	
	
	peers.set(peerKey, {rtcPeerConnection, dataChannel});
}

function peerDisconnected(arg) {
	const peerKey = arg[0];
	const peer = peers.get(peerKey);
	if (peer) {		
		if (peer.dataChannel) {
			peer.dataChannel.close();
		}
		
		if (peer.rtcPeerConnection) {
			peer.rtcPeerConnection.close();
		}
		
		peers.delete(arg[0]);
	}
}

function offerReceived(arg) {
	const peerKey = arg[0];
	const offer = arg[1];
	let dataChannel;
	
	let rtcPeerConnection = new RTCPeerConnection(configuration);
	rtcPeerConnection.onicecandidate = onIceCandidate.bind(rtcPeerConnection, peerKey);
	rtcPeerConnection.ondatachannel = (event) => {
		let dataChannel = event.channel;		
		dataChannel.onopen = handleChannelStatusChange.bind(dataChannel, peerKey);
		dataChannel.onclose = handleChannelStatusChange.bind(dataChannel, peerKey);
		dataChannel.onmessage = onDataChannelMessage.bind(dataChannel, peerKey);
		peers.set(peerKey, {rtcPeerConnection, dataChannel});
	};
	
	rtcPeerConnection.setRemoteDescription(offer)
	.then(() => rtcPeerConnection.createAnswer())
    .then(answer => rtcPeerConnection.setLocalDescription(answer))
	.then(() => wampSession.publish('answer', [wampSession.id, rtcPeerConnection.localDescription], {}, {eligible: [peerKey]}))
	.catch(reason => console.log(reason));	

	peers.set(peerKey, {rtcPeerConnection});
}

function answerReceived(arg) {
	const peerKey = arg[0];
	const answer = arg[1];
	const peer = peers.get(peerKey);
	if (peer) {
		peer.rtcPeerConnection.setRemoteDescription(answer);
	}
}

function iceReceived(arg) {
	const peerKey = arg[0];
	const ice = arg[1];
	const peer = peers.get(peerKey);
	if (peer) {
		peer.rtcPeerConnection.addIceCandidate(ice);
	}
}

function handleChannelStatusChange(peerKey, event) {
	const dataChannel = event.currentTarget;
	if (dataChannel) {
		const state = dataChannel.readyState;		
		if (state === "open") {
			nodes.add({id:peerKey, label:peerKey});
			edges.add({from:wampSession.id, to:peerKey});
			
			for (let key of peers.keys()) {
			  if (key !== peerKey) {
				  
				  const connections = edges.get({
					  filter: edge => edge.from === key && edge.to === peerKey ||
					                  edge.from === peerKey && edge.to === key
				  });
				  if (!connections || connections.length === 0) {				  
					  edges.add({from:key, to:peerKey});
				  }
			  }
			}			
		}
		else {
			nodes.remove(peerKey);
		}
	}
}

function onIceCandidate(peerKey, event) {
    if (event.candidate) { 
    	wampSession.publish('ice', [wampSession.id, event.candidate], {}, {eligible: [peerKey]})
    } 
}

function onDataChannelMessage(peerKey, event) {
	outputDiv.innerHTML = `<p>Message '<strong>${event.data}</strong>' received from ${peerKey}</p>`
		+ outputDiv.innerHTML;
}

function sendP2PMessage(msg) {
	
	outputDiv.innerHTML = `<p>Sent message '<strong>${msg}</strong>' to peers</p>`
		+ outputDiv.innerHTML;
	
	for (let peer of peers.values()) {
		if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
			peer.dataChannel.send(msg);
		}
	}
}
