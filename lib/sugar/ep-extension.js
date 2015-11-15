'use strict';
var _ = require( 'lodash' );
var Q = require( 'q' );

/**
 * Extension plugin.
 *
 * @param {qrs} base - Base class, instance of `qrs`.
 * @api public
 */
function Extension ( base ) {

	// Borrowed from http://stackoverflow.com/questions/17251764/lodash-filter-collection-using-array-of-values
	_.mixin( {
		'findByValues': function ( collection, property, values ) {
			return _.filter( collection, function ( item ) {
				return _.contains( values, item[property] );
			} );
		}
	} );

	var defaultFilter = [
		'visualization',
		'visualization-template',
		'mashup',
		'mashup-template'
	];

	/**
	 * Return all installed extensions. Optionally pass in a filter, to get only returned those extensions matching the given filter.
	 *
	 * @param {String[]} [filter] - Optional. Filter installed extensions by `type`. Example: filter = `['visualization', 'visualization-type']` will only return visualization extensions and visualization extension templates.
	 * @returns {promise}
	 * @api public
	 */
	 this.getInstalled = function ( filter ) {
		var defer = Q.defer();
		base.get( '/qrs/extension/schema' ).then( function ( data ) {

			if ( filter ) {
				defer.resolve(_.findByValues( data, 'type', filter ));
			} else
			{
				defer.resolve( _.findByValues( data, 'type', defaultFilter));
			}

		}, function ( err ) {
			defer.reject( err );
		} );

		return defer.promise;
	};

	/**
	 * Same as getInstalled but only returns visualization extensions (type `visualization`).
	 * @returns {promise}
	 * @api public
	 */
	this.getInstalledVis = function (  ) {
		return this.getInstalled( ['visualization'] );
	};

	/**
	 * Same as `getInstalled` but only returns extensions of type `visualization-template`, which are the templates for the Extension editor in Dev Hub.
	 * @returns {promise}
	 * @api public
	 */
	this.getInstalledVisTemplates = function () {
		return this.getInstalled(['visualization-template']);
	};

	/**
	 * Same as `getInstalled` but only returns extensions of type `mashup`.
	 * @returns {promise}
	 * @api public
	 */
	this.getInstalledMashups = function () {
		return this.getInstalled(['mashup']);
	};

	/**
	 * Same as `getInstalled` but only returns extensions of type `mashup`.
	 * @returns {promise}
	 * @api public
	 */
	this.getInstalledMashupTemplates = function () {
		return this.getInstalled(['mashup-template']);
	};

	/**
	 * Deletes an extension.
	 * @param {String} name - Name of the extension.
	 */
	this.delete = function ( name ) {

	};

	/**
	 * Uploads an extension.
	 * @param zipFilePath
	 */
	var upload = function ( zipFilePath ) {

	};

	/**
	 * Returns whether an extension is installed or not.
	 * @param name
	 */
	var isInstalled = function ( name ) {

		var defer = Q.defer();

		var retVal =  {
			isInstalled: false,
			name: name,
			info: {}
		};
		defer.resolve( retVal );
		return defer.promise;
	};
}

module.exports = Extension;
