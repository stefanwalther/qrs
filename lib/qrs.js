'use strict';
var extend = require( 'extend-shallow' );
var _ = require( 'lodash' );
var Q = require( 'q' );
var request = require( 'request' );
var S = require( 'string' );
var fs = require( 'fs' );

/**
 * Work with Qlik Sense's REST based Repository API (qrs) from within node.js.
 *
 * @param {Object} `qrsConfig` Global configuration options
 * @constructor
 * @api public
 */
var qrs = function qrs ( qrsConfig ) {

	var that = this;
	this.config = {
		host: '127.0.0.1',
		useSSL: false,
		xrfkey: 'ABCDEFG123456789',
		authentication: 'windows',
		headerKey: '',
		headerValue: '',
		virtualProxy: ''
	};
	if ( qrsConfig && !_.isEmpty( qrsConfig ) ) {
		this.config = extend( this.config, qrsConfig );
	}

	/**
	 * Set global configurations options for qrs.
	 *
	 * @api public
	 */
	this.setConfig = function ( opts ) {
		if ( typeof opts !== 'undefined' && !_.isEmpty( opts ) ) {
			that.config = extend( that.config, opts );
		}
		return that.config;
	};

	/**
	 * Return the current configuration
	 *
	 * @returns {qrsConfig} qrsConfig Current configuration object.
	 * @api public
	 */
	this.getConfig = function () {
		return that.config;
	};

	/**
	 * Change a single configuration property
	 *
	 * @param key {string} Key of the property
	 * @param val {*} Value
	 * @api public
	 */
	this.set = function ( key, val ) {
		that.config[key] = val;
	};

	/**
	 * Retrieve a single configuration property.
	 * @param key {String}  Key of the property
	 * @returns {*} Value of the requested property, otherwise undefined.
	 * @api public
	 */
	this.getConfigValue = function ( key ) {
		return that.config[key];
	};

	/**
	 * Return the Url for the REST call considering the configuration options
	 * @param endpoint {string} Endpoint for the qrs call.
	 * @api public
	 */
	this.getUrl = function ( endpoint, params ) {
		var url = ((that.config.useSSL) ? 'https://' : 'http://');                                                            	// http://
		url += that.config.host;                                                                                              	// http://host
		url += (that.config.port && _.isNumber( that.config.port ) && that.config.port !== 0) ? ':' + that.config.port : '';  	// http[s]://host[:port]
		url += '/';                                                                                                          	// http[s]://host[:port]/
		url += ((that.config.virtualProxy && !_.isEmpty( that.config.virtualProxy )) ? that.config.virtualProxy + '/' : '');  	// http[s]://host[:port]/[vp/]
		url += (!S( endpoint ).startsWith( 'qrs/' ) ? 'qrs/' : '');
		url += endpoint;
		url += '/?';

		var urlParams = params || [];
		urlParams.push( {'key': 'xrfkey', 'value': that.config.xrfkey} );
		urlParams.forEach( function ( param ) {																					// parameters
			url += param.key + '=' + param.value + '&';
		} );
		url = S( url ).chompRight( '&' ).s;

		return url;
	};

	/**
	 *
	 * @param endpoint
	 * @param urlParams
	 * @returns {*|promise}
	 * @api public
	 */
	this.get = function ( endpoint, urlParams ) {
		return this.request( 'GET', endpoint, urlParams );
	};

	/**
	 * (Internal) generic method to send requests to QRS.
	 * Typically this method is only used internally, use `get`, `post`, `put` or `delete`.
	 *
	 * **Example**
	 *
	 * ```js
	 * var QRS = require('qrs');
	 *
	 * var qrsConfig = ...; // Set configuration options
	 * var qrs = new QRS( qrsConfig );
	 *
	 * qrs.request( 'GET', 'about', null, null)
	 *    .then( function( data ) {
	 * 			console.log( 'about', data );
	 * 		}, function ( err ) {
	 *			console.error( 'An error occurred: ', err);
	 * 		});
	 * ```
	 *
	 * @param {String} `method` Http method, can be `GET`, `POST`, `PUT` or `DELETE` (defaults to `GET`).
	 * @param {String} `endpoint` Endpoint to be used. Check the online documentation of the Qlik Sense Repository API to get a list of all endpoints available.
	 * @param {String[]} `urlParams` Additional URL parameters, defined as key/value array.
	 * @param {Object} `body` Object to be used as the body for the Http request.
	 * @returns {promise} Returns a promise.
	 *
	 * @api public
	 *
	 */
	this.request = function ( method, endpoint, urlParams, body ) {

		var defer = Q.defer();
		var validConfig = _validateConfig();

		if ( !validConfig ) {
			defer.reject( {error: {errorMsg: 'Invalid configuration', errSource: 'qrs.request'}} );
		} else {

			var url = this.getUrl( S( endpoint ).chompLeft( '/' ), urlParams );
			var headers = _getHeaders();

			var requestOptions = {
				method: method || 'GET',
				url: url,
				headers: headers,
				proxy: that.config.fiddler ? 'http://127.0.0.1:8888' : null,
				json: body
				//timeout: 2000
			};
			if ( that.config.authentication === 'certificates' ) {
				/*jshint ignore:start*/
				if ( that.config['cert'] ) { requestOptions.cert = fs.readFileSync( that.config['cert'] );}
				if ( that.config['key'] ) {requestOptions.key = fs.readFileSync( that.config['key'] );}
				if ( that.config['ca'] ) {requestOptions.ca = fs.readFileSync( that.config['ca'] );}
				/*jshint ignore:end*/
				if ( that.config.passphrase && !_.isEmpty( that.config.passphrase ) ) {requestOptions.passphrase = that.config.passphrase;}
			}

			request( requestOptions, function ( error, response, responseBody ) {

					//Todo: encapsulate content fetching
					if ( error || (response.statusCode < 200 || response.statusCode > 299) ) {
						defer.reject( {
							error: error,
							response: response
						} );
					} else {
						var r = null;
						if ( response.statusCode !== 204 ) {
							if ( _.isObject( responseBody ) ) {
								r = responseBody;
							} else {
								try {
									r = JSON.parse( responseBody );
								} catch ( e ) {
									r = responseBody;
								}
							}
						}
						defer.resolve( r );
					}
				}
			);
		}
		return defer.promise;
	};

	/**
	 * Use POST endpoints.
	 *
	 * @param {String} `endpoint` QRS endpoint to be used.
	 * @param {String[]} urlParams Additional URL parameters, defined as key/value array.
	 * @param {Object} body Body to be posted, defined as JSON object.
	 * @returns {*|promise}
	 * @api public
	 */
	this.post = function ( endpoint, urlParams, body ) {
		return this.request( 'POST', endpoint, urlParams, body );
	};

	/**
	 *
	 * @param endpoint
	 * @param id
	 * @param urlParams
	 * @returns {*|promise}
	 * @api public
	 */
	this.delete = function ( endpoint, id, urlParams ) {
		var finalEndpoint = S( endpoint ).ensureRight( '/' ) + id;
		return this.request( 'DELETE', finalEndpoint, urlParams );
	};

	/**
	 *
	 * @param endpoint
	 * @param id
	 * @param urlParams
	 * @param body
	 * @returns {*|promise}
	 * @api public
	 */
	this.put = function ( endpoint, id, urlParams, body ) {
		var finalEndpoint = S( endpoint ).ensureRight( '/' ) + id;
		return this.request( 'PUT', finalEndpoint, urlParams, body );
	};

	// ****************************************************************************************
	// Plugins
	// ****************************************************************************************

	/**
	 *
	 * @type {Array}
	 * @api public
	 */
	this.plugins = [];

	/**
	 *
	 * @param plugin
	 * @api plugins
	 */
	this.registerPlugin = function ( plugin ) {
		if ( !this[plugin.name.toLowerCase()] ) {
			/*jshint -W055 */
			var o = new plugin( this );
			/*jshint +W055 */
			this.plugins[plugin.name.toLowerCase()] = o;
			this[plugin.name.toLowerCase()] = o;
		} else {
			throw new Error( 'Plugin cannot be registered. Namespace for qrs.' + plugin.name.toLowerCase() + ' is already reserved.' );
		}
	};

	//Todo: Load all plugins from sugar dir
	var m = require( './sugar/ep-mime' );
	this.registerPlugin( m );

	// ****************************************************************************************
	// Internal Helper
	// ****************************************************************************************
	var _getHeaders = function () {

		var header = {
			'X-Qlik-xrfkey': that.config.xrfkey
		};
		if ( that.config.headerKey && that.config.headerValue ) {
			header[that.config.headerKey] = that.config.headerValue;
		}
		return header;

	};

	// ****************************************************************************************
	// Validation
	//Todo: implement a more generic validation
	// ****************************************************************************************
	var _validateConfig = function () {

		switch ( that.config.authentication ) {
			case 'header':
				var required = ['headerKey', 'headerValue', 'xrfkey', 'isSSL', 'virtualProxy'];
				return _validateConfigMissing( that.config, required );
			case 'ntlm':
				return true;
			case 'certificates':
				var required = ['cert', 'key', 'ca'];
				return _validateConfigMissing( that.config, required );
		}

	};

	var _validateConfigMissing = function ( configs, required ) {

		var missing = [];
		_.each( required, function ( item ) {
			if ( !configs.hasOwnProperty( item ) ) {
				missing.push( item );
			}
		} );
		return (missing.length === 0);
	};

	//var _validateFiles = function ( files ) {
	//	files.forEach( function ( item ) {
	//		if (!fs.existsSync()
	//	})
	//}

};

module.exports = qrs;
