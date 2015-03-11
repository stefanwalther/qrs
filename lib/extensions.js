'use strict';
var Q = require( 'q' ),
  _ = require( 'lodash' );

var Ext = function ( base ) {

  var cfg = base.config;
  var that = this;

  return {
    config: cfg,
    delete: function ( name ) {

    },
    upload: function ( file ) {

    },
    getInstalled: function ( filter ) {

      var defaultFilter = {
        isVisualizationTemplate: false,
        isMashupTemplate: false,
        isVisualization: true
      };
      defaultFilter = extend( defaultFilter, filter );

      var defer = Q.defer();

      this.query( 'extension/schema' )
        .then( function ( data ) {
          defer.resolve( filterExtensions( data, defaultFilter ) );
        } )
        .catch( function ( data ) {
          defer.reject( data );
        } );

      return defer.promise;
    },
    _filterExtensions: function ( data, filter ) {
      var filteredList = [];
      _.each( data, function ( item ) {
        //console.log( 'item', item );
        if ( filter.isVisualizationTemplate && item.type === 'visualization-template' ) {
          filteredList.push( item );
        }
        if ( filter.isMashupTemplate && item.type === 'mashup-template' ) {
          filteredList.push( item );
        }
        if ( filter.isVisualization && item.type === 'visualization' ) {
          filteredList.push( item );
        }
      } );
      return filteredList;
    }

  }

};

module.exports = Ext;
