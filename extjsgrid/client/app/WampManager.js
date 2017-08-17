Ext.define('Demo.WampManager', {
	singleton: true,
	mixins: {
		observable: 'Ext.util.Observable'
	},

	wsURL: null,
	wampConnection: null,
	wampSession: null,

	constructor: function(config) {
		const serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
		this.wsURL = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + serverPathUrl + "wamp";

		this.mixins.observable.constructor.call(this, config);
	},

	isActive: function() {
		return this.wampSession !== null;
	},

	start: function() {
		if (this.isActive()) {
			return;
		}

		this.wampConnection = new autobahn.Connection({
			url: this.wsURL
		});

		this.wampConnection.onopen = this.onconnect.bind(this);
		this.wampConnection.onclose = this.onhangup.bind(this);
		this.wampConnection.open();
	},

	stop: function() {
		if (this.isActive()) {
			this.wampConnection.close();
		}
	},

	onconnect: function(session, details) {
		try {
			this.wampSession = session;
			this.fireEvent('connect', session);
		}
		catch (e) {
			console.log(e);
		}
	},

	onhangup: function(reason, details) {
		this.fireEvent('hangup', reason);
		this.wampSession = null;
	},

	subscribe: function(topic, fn) {
		if (!this.isActive()) {
			return;
		}

		this.wampSession.subscribe(topic, fn);
	}
});