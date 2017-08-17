Ext.define('Demo.WampStore', {
	extend: 'Ext.data.Store',

	requires: [ 'Demo.WampProxy' ],
	autoSync: false,

	constructor: function() {
		this.callParent(arguments);
		const proxy = this.model.getProxy();
		this.mon(proxy, {
			scope: this,
			oncreate: proxy.api.oncreate ? this.onCreated : Ext.emptyFn,
			onupdate: proxy.api.onupdate ? this.onUpdated : Ext.emptyFn,
			ondestroy: proxy.api.ondestroy ? this.onDestroyed : Ext.emptyFn
		});
	},
	
	onCreated: function(obj) {
		const data = this.toArray(obj);
		this.suspendAutoSync();
		for (let i = 0; i < data.length; i++) {
			const record = this.getById(data[i][this.model.prototype.idProperty]);
			if (record) {
				Object.keys(data[i]).forEach(k => {
					if (k !== 'id') {
						record.set(k, data[i][k]);
					}
				});
				record.commit();
			} else {
				this.insert(0, new this.model(data[i]));
			}
			if (!(this.remoteSort || this.buffered)) {
				this.sort();
			}
		}
		this.resumeAutoSync();
	},
	
	onUpdated: function(obj) {
		const data = this.toArray(obj);
		this.suspendAutoSync();
		for (let i = 0; i < data.length; i++) {
			const record = this.getById(data[i][this.model.prototype.idProperty]);
			if (record) {
				Object.keys(data[i]).forEach(k => {
					if (k !== 'id') {
						record.set(k, data[i][k]);
					}
				});
				record.commit();
			}
		}
		if (!(this.remoteSort || this.buffered)) {
			this.sort();
		}
		this.resumeAutoSync();
	},
	
	onDestroyed: function(obj) {
		const data = this.toArray(obj);
		this.suspendAutoSync();
		for (let i = 0; i < data.length; i++) {
			const record = this.getById(data[i][this.model.prototype.idProperty]);
			if (record) {
				this.remove(record);
			}
		}
		this.resumeAutoSync();
	},
	
	toArray: function(obj) {
		if (Ext.isArray(obj)) {
			return obj;
		}
		return [ obj ];
	}
});