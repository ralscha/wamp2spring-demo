Ext.define('Demo.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    
    init() {
    	Demo.WampManager.on("connect", function(session) {
    		this.getStore('books').load();
    	}, this);
    	
    	Demo.WampManager.start();
    },
    
    onAddBookClick() {
    	const newBook = new Demo.model.Book({
			isbn: '',
			link: '',
			title: 'NewTitle',
			publisher: 'NewPublisher'
		});

		this.getStore('books').insert(0, newBook);		
    },
    
    onRemoveBookClick() {
    	const selectedBook = this.getViewModel().get('selectedBook');
    	if (selectedBook) {
    		this.getStore('books').remove(selectedBook);
    	}
    },
    
    onAutosyncChange(cb, value) {
    	this.getStore('books').setAutoSync(value);
    },
    
    rejectChanges() {
    	this.getStore('books').rejectChanges();
    },
    
    syncChanges() {
    	this.getStore('books').sync();
    }
});
