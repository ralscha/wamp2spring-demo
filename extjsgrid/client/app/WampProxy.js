Ext.define('Demo.WampProxy', {
	extend: 'Ext.data.proxy.Server',
	alias: 'proxy.wamp',
	session: null,
	
	constructor: function(config) {
		this.callParent([ config ]);
		this.api = Ext.apply({}, config.api || this.api);

		if (Demo.WampManager.isActive()) {
			this.session = Demo.WampManager.wampSession;
			this.register();
		} else {
			Demo.WampManager.on('connect', function(session) {
				this.session = session;
				this.register();
			}, this, {
				single: true
			});
		}
	},
	
	register: function() {
		if (this.api.oncreate) {
			Demo.WampManager.subscribe(this.api.oncreate, arg => {
				this.fireEvent('oncreate', arg);
			});
		}

		if (this.api.onupdate) {
			Demo.WampManager.subscribe(this.api.onupdate, arg => {
				this.fireEvent('onupdate', arg);
			});
		}

		if (this.api.ondestroy) {
			Demo.WampManager.subscribe(this.api.ondestroy, arg => {
				this.fireEvent('ondestroy', arg);
			});
		}
	},	
	
	doRequest: function(operation) {		
		const writer = this.getWriter();
		let request = this.buildRequest(operation); 
		let jsonData;
		let params;

		if (writer && operation.allowWrite()) {
			request = writer.write(request);
		}

		params = request.getParams();

		if (params) {
			jsonData = request.getJsonData();
			if (jsonData) {
				jsonData = Ext.Object.merge({}, jsonData, params);
			}
			else {
				jsonData = params;
			}
			request.setJsonData(jsonData);
			request.setParams(undefined);
		}

		const jd = request.getJsonData();
		let requestData;
		if (jd[0]) {
			requestData = [];
			Object.keys(jd).forEach(k => requestData.push(jd[k]));
		}
		else {
			requestData = jd;
		}
		
		const fn = this.api[request.getAction()];
		const me = this;
		try {
			this.session.call(fn, [requestData]).then(
			function(response) {
				me.processResponse(true, operation, request, response);
			},
			function(err) {
				me.processResponse(false, operation, request, err);
			});
		} catch (e) {
			me.processResponse(false, operation, request, {
				success: false,
				message: 'No wamp session, ' + e
			});
		}
	},

	buildRequest: function(operation) {
		let initialParams = Ext.apply({}, operation.getParams()),
		// Clone params right now so that they can be mutated at any point
		// further down the call stack
		params = Ext.applyIf(initialParams, this.getExtraParams() || {}), request, operationId, idParam;

		// copy any sorters, filters etc into the params so they can be sent
		// over the wire
		Ext.applyIf(params, this.getParams(operation));

		// Set up the entity id parameter according to the configured nathis.
		// This defaults to "id". But TreeStore has a "nodeParam" configuration
		// which
		// specifies the id parameter name of the node being loaded.
		operationId = operation.getId();
		idParam = this.getIdParam();
		if (operationId !== undefined && params[idParam] === undefined) {
			params[idParam] = operationId;
		}

		request = new Ext.data.Request({
			params: params,
			action: operation.getAction(),
			records: operation.getRecords(),
			operation: operation,
		});

		/*
		 * Save the request on the Operation. Operations don't usually care
		 * about Request and Response data, but in the ServerProxy and any of
		 * its subclasses we add both request and response as they may be useful
		 * for further processing
		 */
		operation.setRequest(request);

		return request;
	},
	
    processResponse: function(success, operation, request, response) {
        var me = this,
            exception, reader, resultSet, meta;
        
        // Async callback could have landed at any time, including during and after 
        // destruction. We don't want to unravel the whole response chain in such case. 
        if (me.destroying || me.destroyed) {
            return;
        }
 
        // Processing a response may involve updating or committing many records 
        // each of which will inform the owning stores, which will ultimately 
        // inform interested views which will most likely have to do a layout 
        // assuming that the data shape has changed. 
        // Bracketing the processing with this event gives owning stores the ability 
        // to fire their own beginupdate/endupdate events which can be used by interested 
        // views to suspend layouts. 
        me.fireEvent('beginprocessresponse', me, response, operation);
 
        if (success === true) {
            reader = me.getReader();
 
            if (response === null) {
                resultSet = reader.getNullResultSet();
            } else {
                resultSet = reader.read(me.extractResponseData(response), {
                    // If we're doing an update, we want to construct the models ourselves. 
                    recordCreator: operation.getRecordCreator()
                });
            }
 
            operation.process(resultSet, request, response);
            exception = !operation.wasSuccessful();
        } else {
            me.setException(operation, response);
            exception = true;
        }
        
        // It is possible that exception callback destroyed the store and owning proxy, 
        // in which case we can't do nothing except punt. 
        if (me.destroyed) {
            return;
        }
        
        if (exception) {
            me.fireEvent('exception', me, response, operation);
        }
        // If a JsonReader detected metadata, process it now. 
        // This will fire the 'metachange' event which the Store processes to fire its own 'metachange' 
        else {
            meta = resultSet.getMetadata();
            if (meta) {
                me.onMetaChange(meta);
            }
        }
 
        // Ditto 
        if (me.destroyed) {
            return;
        }
 
        me.afterRequest(request, success);
 
        // Tell owning store processing has finished. 
        // It will fire its endupdate event which will cause interested views to  
        // resume layouts. 
        me.fireEvent('endprocessresponse', me, response, operation);
    }	

});