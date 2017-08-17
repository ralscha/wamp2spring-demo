Ext.define('Demo.view.main.MainModel', {
	extend: 'Ext.app.ViewModel',

	data: {
		selectedBook: null
	},

	stores: {
		books: {
			xclass: 'Demo.WampStore',
			model: 'Demo.model.Book',
			autoLoad: false,
			remoteSort: true,
			autoSync: true
		}
	}

});
