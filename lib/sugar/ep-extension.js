'use strict';
var  _ = require( 'lodash' );

/**
 *
 * @param base
 * @returns {{getInstalled: getInstalled}}
 * @api public
 */
function Extension ( base ) {

	/**
	 * Return all installed extensions.
	 *
	 * **Example:**
	 *
	 * **Example defining a filter:**
	 *
	 * **Default filter:**
	 * var defaultFilter = {
	 * 	visualizationExtension: true,
	 * 	visualizationTemplate: false,
	 * 	mashup: false,
	 * 	mashupTemplate: false
	 * }
	 *
	 * @param filter
	 * @api public
	 */
	var getInstalled = function ( filter  ) {
		return filter;
	};

	//var getInstalledVisExtensons = function () {
	//
	//};

	/**
	 * Same as `getInstalled` but with filter �isMashupTemplate: true`
	 */
	//var getInstalledMashups = function (  ) {
	//
	//};

	//var isInstalled = function (  ) {
	//
	//};

	//var del = function (  ) {
	//
	//};

	//var upload = function (  ) {
	//
	//};

	return {
		//del: del,
		getInstalled: getInstalled
		//isInstalled: isInstalled,
		//upload: upload
	};

 //  getInstalled: function ( filter ) {
  //
  //    var defaultFilter = {
  //      isVisualizationTemplate: false,
  //      isMashupTemplate: false,
  //      isVisualization: true
  //    };
  //    defaultFilter = extend( defaultFilter, filter );
  //
  //    var defer = Q.defer();
  //
  //    this.query( 'extension/schema' )
  //      .then( function ( data ) {
  //        defer.resolve( filterExtensions( data, defaultFilter ) );
  //      } )
  //      .catch( function ( data ) {
  //        defer.reject( data );
  //      } );
  //
  //    return defer.promise;
  //  },
  //  _filterExtensions: function ( data, filter ) {
  //    var filteredList = [];
  //    _.each( data, function ( item ) {
  //      //console.log( 'item', item );
  //      if ( filter.isVisualizationTemplate && item.type === 'visualization-template' ) {
  //        filteredList.push( item );
  //      }
  //      if ( filter.isMashupTemplate && item.type === 'mashup-template' ) {
  //        filteredList.push( item );
  //      }
  //      if ( filter.isVisualization && item.type === 'visualization' ) {
  //        filteredList.push( item );
  //      }
  //    } );
  //    return filteredList;
  //  }
  //
  //}

}

module.exports = Extension;
