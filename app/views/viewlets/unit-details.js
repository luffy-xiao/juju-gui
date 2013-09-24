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


YUI.add('viewlet-unit-details', function(Y) {
  var ns = Y.namespace('juju.viewlets'),
      views = Y.namespace('juju.views'),
      templates = views.Templates,
      models = Y.namespace('juju.models'),
      utils = Y.namespace('juju.views.utils');

  /**
    Updates a node with a display of the given address and ports.

    @method updateAddress
    @param {Y.Node} node The node to be updated.
    @param {String} value The IP address.
    @param {Array} value An array of the ports exposed.
    @return {undefined} Mutates the node.
    */
  var updateAddress = function(node, value, open_ports) {
    node.empty();
    if (!value) { return; }
    var protocol;
    var protocols = {443: 'https', 80: 'http'};
    if (open_ports && open_ports.length) {
      Object.keys(protocols).some(function(port) {
        if (open_ports.indexOf(port) >= 0 ||
            open_ports.indexOf(parseInt(port, 10)) >= 0) {
          protocol = protocols[port];
          return true; // Short-circuits the loop.
        }
      });
    }
    var infoNode;
    if (protocol) {
      infoNode = Y.Node.create('<a></a>').setAttrs({
        href: protocol + '://' + value + '/',
        target: '_blank',
        text: value
      });
    } else {
      infoNode = Y.Node.create(value);
    }
    node.append(infoNode);
    if (open_ports && open_ports.length) {
      // YUI 3 trims HTML because IE (<10?) does it. :-/
      node.append('&nbsp;| Ports&nbsp;');
      var previous;
      open_ports.forEach(function(port) {
        if (previous) {
          node.append(',&nbsp;');
        }
        previous = port;
        var protocol = protocols[port.toString()] || 'http';
        node.append(Y.Node.create('<a></a>').setAttrs({
          href: protocol + '://' + value + ':' + port + '/',
          target: '_blank',
          text: port
        }));
      });
    }
  };
  ns.updateUnitAddress = updateAddress; // Expose for testing.

  ns.unitDetails = {
    name: 'unitDetails',
    templateWrapper: templates['left-breakout-panel'],
    template: templates.unitOverview,
    slot: 'left-hand-panel',
    bindings: {
      agent_state_info: {
        'update': function(node, value) {
          if (value) {
            node.one('span').set('text', value);
            node.show();
          } else {
            node.hide();
          }
        }
      },
      'annotations.landscape-computer': {
        'update': function(node, value) {
          if (value) {
            var unit = this.viewlet.model;
            var environment = this.viewlet.options.db.environment;
            node.one('a').set(
                'href', utils.getLandscapeURL(environment, unit));
            node.show();
          } else {
            node.hide();
          }
        }
      },
      private_address: {
        depends: ['open_ports'],
        'update': function(node, value) {
          updateAddress(node, value, this.viewlet.model.open_ports);
        }
      },
      public_address: {
        depends: ['open_ports'],
        'update': function(node, value) {
          updateAddress(node, value, this.viewlet.model.open_ports);
        }
      }
    },

    // Return the template context for the unit detail view.
    'getContext': function(db, service, unit) {
      // This should be handled with bindings, once per-unit relation
      // information is actually sanely available from Juju Core.
      // Of course, that might be tricky unless we also keep track of
      // relation errors on the db's unit models....
      // Ignore relations errors.
      var relation_errors = unit.relation_errors || {},
          relations = utils.getRelationDataForService(db, service);
      Y.each(relations, function(rel) {
        var match = relation_errors[rel.near.name],
            far = rel.far || rel.near;
        rel.has_error = !!(match && match.indexOf(far.service) > -1);
      });
      return {
        unit: unit,
        relations: relations
      };
    },

    'render': function(unit, viewletManagerAttrs) {
      var db = viewletManagerAttrs.db;
      var service = db.services.getById(unit.service);
      var context = this.getContext(db, service, unit);
      this.container = Y.Node.create(this.templateWrapper({}));
      this.container.one('.content').setHTML(this.template(context));
    }
  };
}, '0.0.1', {
  requires: [
    'node',
    'juju-charm-models',
    'juju-templates',
    'juju-view'
  ]
});
