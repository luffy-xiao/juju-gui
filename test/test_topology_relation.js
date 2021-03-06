/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2012-2013 Canonical Ltd.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License version 3, as published by
the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranties of MERCHANTABILITY,
SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

describe('topology relation module', function() {
  var Y, utils, views, view, container, topo, db;

  before(function(done) {
    Y = YUI(GlobalConfig).use(
        ['juju-tests-utils', 'juju-topology', 'node',
          'node-event-simulate', 'juju-view-utils'],
        function(Y) {
          views = Y.namespace('juju.views');
          utils = Y.namespace('juju-tests.utils');
          done();
        });
  });

  beforeEach(function() {
    container = utils.makeContainer(this);
    view = new views.RelationModule();
  });

  afterEach(function() {
    if (topo) {
      topo.unbind();
    }
    if (db) {
      db.destroy();
    }
  });

  it('exposes events', function() {
    // The RelationModule's events are wired into the topology view by
    // addModule.  Three types of events are supported: "scene", "yui", and
    // "d3".
    assert.deepProperty(view, 'events.scene');
    assert.deepProperty(view, 'events.yui');
    assert.deepProperty(view, 'events.d3');
  });

  it('fires a "clearState" event if a drag line is clicked', function() {
    var firedEventName;
    var topo = {
      fire: function(eventName) {
        firedEventName = eventName;
      }
    };
    view.set('component', topo);
    view.draglineClicked(undefined, view);
    assert.equal(firedEventName, 'clearState');
  });

  it('fires \'addRelationStart\' event when making a relation', function() {
    var flags = {
      hideServiceMenu: 0,
      addRelationStart: 0
    };
    var topo = {
      fire: function(e) {
        flags[e] = 1;
      },
      // stubs
      get: function(val) {
        if (val === 'container') {
          return {
            one: function() {
              return {
                hasClass: function() { return false; }
              };
            }
          };
        }
      }
    };
    // stubs
    var context = {
      get: function(val) {
        if (val === 'component') { return topo; }
        if (val === 'container') {
          return {
            one: function() {
              return {
                hasClass: function() { return false; },
                getDOMNode: function() { return; }
              };
            }
          };
        }
      },
      addRelationDragStart: function() { return; },
      mousemove: function() { return; },
      addRelationStart: function() { return; }
    };
    view.addRelButtonClicked(null, context);
    assert.deepEqual(flags, {
      hideServiceMenu: 1,
      addRelationStart: 1
    });
  });

  it('fires \'addRelationEnd\' event when done making a relation', function() {
    var counter = 0;
    var topo = {
      fire: function(e) {
        // Other events are fired along side this which we do not care about
        if (e !== 'addRelationEnd') { return; }
        assert.equal(e, 'addRelationEnd');
        counter += 1;
      },
      // stubs
      get: function(val) { return true; },
      vis: {
        selectAll: function() {
          return {
            classed: function() { return; }
          };
        }
      }
    };
    // stubs
    var context = {
      get: function(val) {
        if (val === 'component') { return topo; }
        return true;
      },
      set: function() { return; },
      ambiguousAddRelationCheck: function() { return; }
    };
    view.addRelationDragEnd.call(context);
    view.cancelRelationBuild.call(context);
    assert.equal(counter, 2, 'Event should be fired if a relation line is ' +
        'canceled or completed');
  });

  it('has a list of relations', function() {
    assert.deepEqual(view.relations, []);
  });

  it('has a chainable render function', function() {
    assert.equal(view.render(), view);
  });

  it('retrieves the current relation DOM element when removing', function() {
    var requestedSelector;
    var container = {
      one: function(selector) {
        requestedSelector = selector;
      }
    };
    var env = {
      remove_relation: function() {}
    };
    var topo = {
      get: function() {
        return env;
      }
    };
    var fauxView = {
      get: function(name) {
        if (name === 'component') {
          return topo;
        } else if (name === 'container') {
          return container;
        }
      }
    };
    var relationId = 'the ID of this relation';
    var relation = {
      relation_id: relationId,
      endpoints: [null, null]
    };
    view.removeRelation.call(fauxView, relation, fauxView, undefined);
    assert.equal(
        requestedSelector, '#' + views.utils.generateSafeDOMId(relationId));
  });

  it('fires "inspectRelation" topo event for clicking a relation endpoint',
      function() {
        var topo = {
          fire: utils.makeStubFunction()
        };
        view.set('component', topo);
        view.inspectRelationClick.call(container, undefined, view);
        assert.equal(topo.fire.lastArguments()[0], 'inspectRelation');
      });

});
