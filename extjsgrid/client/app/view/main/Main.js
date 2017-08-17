Ext.define('Demo.view.main.Main', {
	extend: 'Ext.panel.Panel',

	controller: {
		xclass: 'Demo.view.main.MainController'
	},

	viewModel: {
		xclass: 'Demo.view.main.MainModel'
	},

	layout: 'fit',

	items: [ {
		xclass: 'Demo.view.main.List'
	} ]
});
