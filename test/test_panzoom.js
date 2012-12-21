'use strict';

describe('pan zoom module', function() {
  var db, juju, models, viewContainer, views, Y, pz, topo, vis;

  before(function(done) {
    Y = YUI(GlobalConfig).use(['node',
      'juju-models',
      'juju-views',
      'juju-gui',
      'juju-env',
      'juju-tests-utils',
      'node-event-simulate'],
    function(Y) {
      juju = Y.namespace('juju');
      models = Y.namespace('juju.models');
      views = Y.namespace('juju.views');
      done();
    });
  });

  beforeEach(function(done) {
    Y = YUI(GlobalConfig).use(['node',
      'juju-models',
      'juju-views',
      'juju-gui',
      'juju-env',
      'juju-tests-utils',
      'node-event-simulate'],
    function(Y) {
      viewContainer = Y.Node.create('<div />');
      viewContainer.appendTo(Y.one('body'));
      viewContainer.hide();

      db = new models.Database();
      var view = new views.environment({container: viewContainer, db: db});
      view.render();
      view.postRender();
      pz = view.topo.modules.PanZoomModule;
      topo = pz.get('component');
      vis = topo.vis;
      done();
    });
  });

  afterEach(function() {
    viewContainer.remove(true);
  });

  it('initial values are set',
      function() {
        pz._translate.should.eql([0, 0]);
        pz._scale.should.equal(1.0);
      });

  // Test the zoom handler calculations.
  it('zoom scale handles fractional values',
     function() {
       // Floor is used so the scale will round down.
       var evt = { scale: 0.609 };
       var rescaleCalled = false;
       pz.rescale = function() {
         rescaleCalled = true;
       };
       pz.zoomHandler(evt);
       pz.slider.get('value').should.equal(60);
       assert.isTrue(rescaleCalled);
     });

  it('slider has an upper limit',
     function() {
       var evt = { scale: 3.5 };
       var rescaleCalled = false;
       pz.rescale = function() {
         rescaleCalled = true;
       };
       pz.zoomHandler(evt);
       pz.slider.get('value').should.equal(200);
       assert.isTrue(rescaleCalled);
     });

  it('slider has a lower limit',
     function() {
       var evt = { scale: 0.18 };
       var rescaleCalled = false;
       pz.rescale = function() {
         rescaleCalled = true;
       };
       pz.zoomHandler(evt);
       pz.slider.get('value').should.equal(25);
       assert.isTrue(rescaleCalled);
     });

  // Test the zoom calculations.
  it('rescale handles fractional values within the limit',
     function(done) {
       // Floor is used so the scale will round down.
       var evt =
           { scale: 0.609,
             translate: 't'};
       var rescaled = false;
       topo.once('rescaled', function() {
         rescaled = true;
         done();
       });
       pz.rescale(vis, evt);
       pz._scale.should.equal(0.609);
       var expected = 'translate(' + evt.translate + ') scale(0.609)';
       vis.attr('transform').should.equal(expected);
       assert.isTrue(rescaled);
     });

  it('rescale sets upper limit',
     function(done) {
       var evt =
           { scale: 2.1,
             translate: 'u'};
       var rescaled = false;
       topo.once('rescaled', function() {
         rescaled = true;
         done();
       });
       topo.set('scale', 2.0);
       pz.rescale(vis, evt);
       pz._scale.should.equal(2.0);
       var expected = 'translate(' + evt.translate + ') scale(2)';
       vis.attr('transform').should.equal(expected);
       assert.isTrue(rescaled);
     });

  it('rescale sets lower limit',
     function(done) {
       var evt =
           { scale: 0.2,
             translate: 'v'};
       var rescaled = false;
       topo.once('rescaled', function() {
         rescaled = true;
         done();
       });
       topo.set('scale', 0.25);
       pz.rescale(vis, evt);
       pz._scale.should.equal(0.25);
       var expected = 'translate(' + evt.translate + ') scale(0.25)';
       vis.attr('transform').should.equal(expected);
       assert.isTrue(rescaled);
     });

});
