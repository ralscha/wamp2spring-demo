Ext.define('Demo.Application', {
	extend: 'Ext.app.Application',
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
