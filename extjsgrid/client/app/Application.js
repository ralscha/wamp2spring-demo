Ext.define('Demo.Application', {
	extend: 'Ext.app.Application',
	requires: ['Ext.data.identifier.Uuid', 'Ext.grid.plugin.CellEditing'],
	name: 'Demo',

	quickTips: false,
	platformConfig: {
		desktop: {
			quickTips: true
		}
	},

	onAppUpdate() {
		window.location.reload();
	}
});
