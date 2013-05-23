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

/**
 * Provide the ImportExportModule  class.
 *
 * @module topology
 * @submodule topology.importexport
 */

YUI.add('juju-topology-importexport', function(Y) {
  var views = Y.namespace('juju.views'),
      models = Y.namespace('juju.models'),
      d3ns = Y.namespace('d3');

  /**
   * Handle ImportExport from the Topology.
   *
   * @class ImportExportModule
   */
  var ImportExportModule = Y.Base.create('ImportExportModule',
                                         d3ns.Module, [], {
        events: {
          scene: {
            '.zoom-plane': {
              dragenter: '_ignore',
              dragover: '_ignore',
              drop: '_handleFileDrop'
            }
          }
        },

        /**
         * Ingore some of the drag events.
         * @method _ignore
         */
        _ignore: function(box, module) {
          var evt = d3.event;
          evt.preventDefault();
          evt.stopPropagation();
        },

        /**
         * Handle file drops with HTML5 reader api
         *
         * @method _handleFileDrop
         */
        _handleFileDrop: function(box, self) {
          // This handler uses the HTML5 File
          // API for DnD support. This event
          // doesn't properly appear in the YUI
          // event wrrapper so we extract it directly
          // from the DOM event.
          var evt = d3.event,
              topo = self.get('component'),
              notifications = topo.get('db').notifications,
              env = topo.get('env'),
              fileSources = evt._event.dataTransfer.files;
          if (fileSources.length) {
            Y.Array.each(fileSources, function(file) {
              var reader = new FileReader();
              reader.onload = function(e) {
                // Import each into the environment
                env.importEnvironment(e.target.result, function(result) {
                  if (!result.error) {
                    notifications.add({
                      title: 'Imported Environment',
                      message: 'Import from "' + file.name + '" successful',
                      level: 'important'
                    });
                  } else {
                    notifications.add({
                      title: 'Import Environment Failed',
                      message: 'Import from "' + file.name +
                          '" failed.<br/>' + result.error,
                      level: 'error'
                    });
                  }
                });
              };
              reader.readAsText(file);
            });
          } else {
            env.importEnvironment(evt._event.dataTransfer.getData('Text'));
          }
          evt.preventDefault();
          evt.stopPropagation();
        },

        /**
         * Update lifecycle phase
         * @method update
         */
        update: function() {
          // Check the feature flag
          if (!this._dragHandle && window.flags.dndexport) {
            var env = this.get('component').get('env');
            this._dragHandle = Y.one('#environment-name')
                                .on('dragstart', function(evt) {
                  env.exportEnvironment(function(r) {
                    var ev = evt._event;
                    ev.dataTransfer.dragEffect = 'copy';
                    var json = JSON.stringify(r.result);
                    ev.dataTransfer.setData('Text', json);
                  });
                  evt.stopPropagation();
                }, this);

            this.get('component')
                .recordSubscription(this, this._dragHandle);

          }
          ImportExportModule.superclass.update.call(this);
        }
      }, {
        ATTRS: {}

      });
  views.ImportExportModule = ImportExportModule;
}, '0.1.0', {
  requires: [
    'node',
    'event',
    'd3-components',
    'juju-models',
    'juju-env',
    'juju-view-utils'
  ]
});