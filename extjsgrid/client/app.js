/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'Demo.Application',

    name: 'Demo',

    requires: [
        // This will automatically load all classes in the Demo namespace
        // so that application classes do not need to require each other.
        'Demo.*'
    ],

    // The name of the initial view to create.
    mainView: 'Demo.view.main.Main'
});
