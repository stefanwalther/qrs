'use strict';
var Q = require( 'q' );
var _ = require( 'lodash' );
var fs = require( 'fs' );

function Mime ( base ) {

	var that = this;
	that.baseClass = base;

	/**
	 * Returns a list of existing mime types.
	 *
	 * The list can be filtered by the file-extensions, e.g.
	 *
	 * ```js
	 * getMimeTypes( 'html')
	 *    .then( function (data) {
	 *
	 * 		// data now contains an array of mime types where the field extensions contains "html"
	 * 		// Results: html, xhtml, etc.
	 *
	 * 	})
	 *
	 * ```
	 *
	 * @param filter {string}
	 * @returns {*|promise}
	 */
	var get = function ( filter ) {

		var queryParams = [];
		if ( !_.isEmpty( filter ) ) {
			queryParams.push( {'key': 'filter', 'value': filter} );
		}
		return that.baseClass.get( 'mimetype/full', queryParams );
	};

	/**
	 * Adds an array of mime types
	 *
	 * @param mimeTypeDefs {mimeTypeDef[]} - Array of mime type definitions.
	 * @returns {*|promise}
	 */
	var addMultiple = function ( mimeTypeDefs ) {

		var defer = Q.defer();
		var results = [];

		defer.resolve();

		if ( mimeTypeDefs && _.isArray( mimeTypeDefs ) ) {

			var promises = [];
			mimeTypeDefs.forEach( function ( mimeTypeDef ) {
				promises.push( add.bind( null, mimeTypeDef ) );
			} );

			return _.reduce( mimeTypeDefs, function ( memo, value ) {
				return memo.then( function () {
					return add( value );
				} ).then( function ( result ) {
					results.push( result );
				} );
			}, defer.promise ).then( function () {
				return results;
			} );

		}
	};

	var addFromFile = function ( filePath ) {

		var defer = Q.defer();
		if ( !fs.existsSync( filePath ) ) {
			defer.reject( 'File does not exist' );
		}
		var data = fs.readFileSync( filePath, {encoding: 'utf-8'} );

		var lines = data.match( /[^\r\n]+/g );
		var mimeTypeDefs = [];
		lines.forEach( function ( line ) {
			var items = line.split( ';' );
			mimeTypeDefs.push( {
				'extensions': items[0],
				'mime': items[1],
				'additionalHeaders': _.isEmpty( items[2] ) ? null : items[2],
				'binary': items[4] === 'true'
			} );
		} );
		addMultiple( mimeTypeDefs )
			.then( function ( data ) {
				defer.resolve( data );
			}, function ( err ) {
				defer.reject( err );
			} );
		return defer.promise;
	};

	/**
	 * Adds a mime type.
	 *
	 * @description
	 * When adding the mime type, it will be checked first if the mime type is already existing.
	 * While checking the following criteria will be considered:
	 *
	 * - file extension
	 * - binary
	 * - mime
	 *
	 * @param mimeTypeDef {mimeTypeDef}
	 */
	var add = function ( mimeTypeDef ) {

		var defer = Q.defer();
		if ( _.isEmpty(mimeTypeDef.mime)) {
			defer.reject('Mime type cannot be empty');
		}
		if ( _.isEmpty(mimeTypeDef.extensions)) {
			defer.reject('Extensions cannot be empty');
		}
		get()
			.then( function ( mimeList ) {
				var o = getUpdateOrInsert( mimeTypeDef, mimeList );
				if ( o.isUpdate ) {
					_update( o.def.id, o.def ).then( function ( data ) {
						defer.resolve( data );
					}, function ( err ) {
						defer.reject( err );
					} );
				} else {
					_add( o.def ).then( function ( data ) {
						defer.resolve( data );
					}, function ( err ) {
						defer.reject( err );
					} );
				}
			}, function ( err ) {
				defer.reject( err );
			} );
		return defer.promise;
	};
	var _add = function ( mimeTypeDef ) {
		return that.baseClass.post( 'mimetype', null, mimeTypeDef );
	};

	var deleteById = function ( id ) {
		return that.baseClass.delete( 'mimetype', id );
	};

	var _update = function ( id, mimeTypeDef ) {
		return that.baseClass.put( 'mimetype', id, null, mimeTypeDef )
	};

	var createExport = function ( filePath ) {

		var defer = Q.defer();
		that.baseClass.get( 'mimetype/full' )
			.then( function ( data ) {

				var s = '';
				for ( var i = 0; i < data.length; i++ ) {
					s += data[i].extensions + ';' + data[i].mime + ';' + data[i].additionalHeaders + ';' + data[i].binary + '\n';
				}
				fs.writeFile( filePath, s, function ( err ) {
					if ( err ) {
						defer.reject( err );
					} else {
						defer.resolve( filePath );
					}
				} );

			}, function ( err ) {
				defer.reject( err );
			} );
		return defer.promise;
	};

	/**
	 * Mime type definition
	 * @typedef {object} mimeTypeDef.
	 * @property {string} mime - Mime type, e.g. "application/markdown".
	 * @property {string} extensions - Comma delimited string of supported file extensions, e.g. "md,markdown".
	 * @property {boolean} additionalHeaders - Additional headers, defaults to null.
	 * @property {boolean} binary - Whether this is a binary file type or not.
	 */

	/**
	 * Returns whether the mime type already exists or not.
	 *
	 * @param {mimeTypeDef} mimeTypeDef
	 * @returns {object} result - Returned result.
	 * @returns {boolean} result.isUpdate - Whether to update or add.
	 */
	var getUpdateOrInsert = function ( mimeTypeDef, listMimeTypes ) {

		var result = {
			isUpdate: false,
			def: {}
		};

		var tmp = _.filter( listMimeTypes, function ( m ) {
			return m.mime === mimeTypeDef.mime && m.binary === mimeTypeDef.binary || false && ((m.additionalHeaders || null) === (mimeTypeDef.additionalHeaders || null));
		} );

		if ( tmp.length === 1 ) {
			result.isUpdate = true;
			var updatedDef = tmp[0];
			updatedDef.extensions = _.uniq( updatedDef.extensions.split( ',' ).concat( mimeTypeDef.extensions.split( ',' ) ) ).join( ',' );
			result.def = updatedDef;
		} else if ( tmp.length === 0 ) {
			result.def = mimeTypeDef;
			result.isUpdate = false;
		} else if ( tmp.length > 1 ) {
			throw new Error( 'More than on mime type found to update' );
		}

		return result;
	};

	return {
		add: add,
		addFromFile: addFromFile,
		addMultiple: addMultiple,
		createExport: createExport,
		get: get,
		getUpdateOrInsert: getUpdateOrInsert,
		deleteById: deleteById
	};
}

module.exports = Mime;



