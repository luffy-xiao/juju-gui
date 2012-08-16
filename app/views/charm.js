YUI.add("juju-view-charm-collection", function(Y) {


var charm_store = new Y.DataSource.IO({
    source: 'http://jujucharms.com:2464/'
});
   
/*
charm_store.plug(
    Y.Plugin.DataSourceJSONSchema, {
	cfg: {schema: {resultListLocator: "results"}}
    });
charm_store.plug(Y.DataSourceCache, { max: 3});
*/

CharmView = Y.Base.create('CharmView', Y.View, [], {
    initializer: function () {
	this.set('charm', null);
	console.log("Loading charm view", this.get('charm_data_url'));
	charm_store.sendRequest({
	    request: this.get('charm_data_url'),
	    callback: {
		'success': Y.bind(this.on_charm_data, this),
		'failure': function er(e) { console.error(e.error) },
	    }});

    },

    template: Y.Handlebars.compile(Y.one("#t-charm").getHTML()),

    render: function () {
	console.log('render', this.get('charm'));
	var container = this.get('container');
        CharmCollectionView.superclass.render.apply(this, arguments);
	if (this.get('charm')) {
	    console.log('charm data render');
	    container.setHTML(this.template({'charm': this.get('charm')}));	
	} else {
	    container.setHTML('<div class="alert">Loading...</div>');
	    container.one('charm-deploy').on(
		'click', Y.bind(this.on_charm_deploy, this));
	}
	return this;
    },

    on_charm_data: function (io_request) {
	var charm = Y.JSON.parse(
	    io_request.response.results[0].responseText);
	console.log('results update', charm, this);
	this.set('charm', charm);
	this.render();
    },

    on_charm_deploy: function(evt) {
	console.log('charm deploy', this.get('charm'));
    }
});

CharmCollectionView = Y.Base.create('CharmCollectionView', Y.View, [], {

    initializer: function () {
	console.log("View: Initialized: Charm Collection", this.get('query'));
        this.set("charms", []);
	this.set('current_request', null);
	Y.one('#omnibar-submit').on("click", Y.bind(this.on_results_change, this));
	this.on_search_change();
    },

    template: Y.Handlebars.compile(Y.one("#t-charm-collection").getHTML()),

    render: function () {
	console.log('render');
	var container = this.get('container'),
	    self = this;

        CharmCollectionView.superclass.render.apply(this, arguments);
	container.setHTML(this.template({'charms': this.get('charms')}));
	container.all('div.thumbnail').each(function( el ) {
	    el.on("click", function(evt) {
		//console.log("Click", this.getData('charm-url'));
		self.fire("showCharm", {charm_data_url: this.getData('charm-url')})
	    })});
        return this;
    },

    on_search_change: function(evt) {
	console.log('search update');
	if (evt) {
	    evt.preventDefault();
	    evt.stopImmediatePropagation();
	}

	var query = Y.one('#charm-search').get('value');
	if (!query) {
	    query = this.get('query');
	} else {
	    this.set('query')
	};

	// The handling in datasources-plugins is an example of doing this a bit better
	// ie. io cancellation outstanding requests, it does seem to cause some interference
	// with various datasource plugins though.
	charm_store.sendRequest({
	    request: 'search/json?search_text=' + query,
	    callback: {
		'success': Y.bind(this.on_results_change, this),
		'failure': function er(e) { console.error(e.error) },
	    }});
    },

    on_results_change: function (io_request) {
	var result_set = Y.JSON.parse(
	    io_request.response.results[0].responseText);
	console.log('results update', result_set, this);
	this.set('charms', result_set.results);
	this.render();
    }

});

Y.namespace("juju.views").charm_collection = CharmCollectionView;
Y.namespace("juju.views").charm = CharmView;

}, "0.1.0", {
    requires: ['node', 
               'handlebars',
	       'datasource-io',
	       'datasource-jsonschema',
	       'io-base',
	       'json-parse',
               'view']
});
