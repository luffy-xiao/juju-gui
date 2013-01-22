'use strict';

(function() {

  describe('Template: service-footer-destroy-service.partial', function() {
    var requires = ['node', 'juju-gui', 'juju-views', 'juju-tests-utils'];
    var Y, conn, env, partial;

    before(function(done) {
      Y = YUI(GlobalConfig).use(requires, function(Y) {
        var partials = Y.Handlebars.partials;
        partial = partials['service-footer-destroy-service'];
        done();
      });
    });

    it('does not display a "Destroy" button for the Juju GUI', function() {
      // Disallow foot-shooting.
      var html = partial({serviceIsJujuGUI: true});
      assert.notMatch(html, /Destroy/);
    });

    it('does display a "Destroy" button for other services', function() {
      var html = partial({serviceIsJujuGUI: false});
      assert.match(html, /Destroy/);
    });

  });
})();

(function() {

  describe('Template: service-footer-common-controls.partial', function() {
    var requires = ['node', 'juju-gui', 'juju-views', 'juju-tests-utils'];
    var Y, conn, env, partial;

    before(function(done) {
      Y = YUI(GlobalConfig).use(requires, function(Y) {
        var partials = Y.Handlebars.partials;
        partial = partials['service-footer-common-controls'];
        done();
      });
    });

    it('includes unit count UI for the Juju GUI service', function() {
      var html = partial({serviceIsJujuGUI: true});
      assert.match(html, /Unit count/);
    });

    it('does not include (un)expose for the Juju GUI service', function() {
      var html = partial({serviceIsJujuGUI: true});
      assert.notMatch(html, /Expose/);
    });

    it('includes unit count UI for non-Juju-GUI services', function() {
      var html = partial({serviceIsJujuGUI: false});
      assert.match(html, /Unit count/);
    });

    it('includes (un)expose for non-Juju-GUI services', function() {
      var html = partial({serviceIsJujuGUI: false});
      assert.match(html, /Expose/);
    });


  });
})();

(function() {

  describe('Template: service-config.handlebars', function() {
    var requires = ['node', 'juju-gui', 'juju-views', 'juju-tests-utils'];
    var warningMessage = /Warning: Changing the settings/;
    var Y, conn, env, template;

    before(function(done) {
      Y = YUI(GlobalConfig).use(requires, function(Y) {
        var templates = Y.namespace('juju.views').Templates;
        template = templates['service-config'];
        done();
      });
    });

    it('includes a warning about reconfiguring the Juju GUI', function() {
      // Reconfiguring the Juju GUI service could break it, causing the user to
      // lose access to the app they are in the process of using.
      var html = template({serviceIsJujuGUI: true});
      assert.match(html, warningMessage);
    });

    it('does not warn about about reconfiguring other services', function() {
      var html = template({serviceIsJujuGUI: false});
      assert.notMatch(html, warningMessage);
    });

  });
})();

(function() {

  describe('Template: service.handlebars', function() {
    var requires = ['node', 'juju-gui', 'juju-views', 'juju-tests-utils'];
    var warningMessage = 'Warning: Changing the settings';
    var divider = '<img class="divider"';
    var Y, conn, env, template;

    before(function(done) {
      Y = YUI(GlobalConfig).use(requires, function(Y) {
        var templates = Y.namespace('juju.views').Templates;
        template = templates.service;
        done();
      });
    });

    it('does not show the destroy or expose UI for Juju GUI', function() {
      var html = template({serviceIsJujuGUI: true, units: []});
      assert.notMatch(html, /Destroy/);
      assert.notMatch(html, /Expose/);
    });

    it('shows the destroy or expose UI for non-Juju-GUI services', function() {
      var html = template({serviceIsJujuGUI: false, units: []});
      assert.match(html, /Destroy/);
      assert.match(html, /Expose/);
    });

  });
})();