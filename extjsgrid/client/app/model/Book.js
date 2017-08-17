Ext.define('Demo.model.Book', {
    extend: 'Ext.data.Model',
    requires: ['Demo.WampProxy'],
    identifier: 'uuid',

    fields: [
        'id', 'title', 'publisher', 'isbn', 'link'
    ],
    
	proxy: {
		type: 'wamp',
		api: {
			create: 'grid.create',
			read: 'grid.read',
			update: 'grid.update',
			destroy: 'grid.destroy',

			oncreate: 'grid.oncreate',
			onupdate: 'grid.onupdate',
			ondestroy: 'grid.ondestroy'
		}
	}
});
