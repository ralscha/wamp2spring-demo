Ext.define('Demo.view.main.List', {
	extend: 'Ext.grid.Grid',

	title: 'Books',

	bind: {
		store: '{books}',
		selection: '{selectedBook}'
	},

	plugins: [ {
		type: 'cellediting'
	} ],

	items: [ {
		xtype: 'toolbar',
		docked: 'top',
		items: [ {
			xtype: 'button',
			text: 'Add Book',
			handler: 'onAddBookClick',
			ui: 'action',
			margin: '0 10 0 0'
		}, {
			xtype: 'button',
			text: 'Remove Book',
			disabled: true,
			bind: {
				disabled: '{!selectedBook}',
			},
			handler: 'onRemoveBookClick',
			ui: 'action'
		}, {
            xtype: 'spacer'
        }, {
			xtype: 'checkbox',
			label: 'Autosync',
			labelWidth: 60,
			width: 90,
			checked: true,
			inputValue: true,
			reference: 'autosyncCB',
			margin: '0 5 0 0',
			listeners: {
				change: 'onAutosyncChange'
			}
		}, {
			xtype: 'button',
			text: 'Rollback',
			disabled: true,
			bind: {
				disabled: '{autosyncCB.checked}',
			},			
			handler: 'rejectChanges',
			ui: 'action',
			margin: '0 10 0 0'
		}, {
			text: 'Sync',
			itemId: 'syncButton',
			disabled: true,
			bind: {
				disabled: '{autosyncCB.checked}',
			},
			handler: 'syncChanges',
			ui: 'action'
		} ]
	} ],

	columns: [ {
		text: 'ID',
		dataIndex: 'id',
		width: 270
	}, {
		text: 'ISBN',
		dataIndex: 'isbn',
		width: 130,
		editor: {
			allowBlank: false
		}
	}, {
		text: 'Title',
		dataIndex: 'title',
		flex: 1,
		editor: {
			allowBlank: false
		}
	}, {
		text: 'Publisher',
		dataIndex: 'publisher',
		width: 120,
		editor: {
			allowBlank: true
		}
	}, {
		text: 'Link',
		dataIndex: 'link',
		xtype: 'templatecolumn',
		cell: {
			encodeHtml: false
		},
		tpl: '<a href="{link}" target="_blank">{link}</a>',
		flex: 1,
		editor: {
			allowBlank: true
		}
	} ]

});
