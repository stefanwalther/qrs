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
 * **Configuration options:**
 * ```js
 * var QRS = require('qrs');
 * var config =  {
		host: '127.0.0.1',
		useSSL: false,
		xrfkey: 'ABCDEFG123456789',
		authentication: 'windows',
		headerKey: '',
		headerValue: '',
		virtualProxy: ''
	};
 *
 * var qrs = new QRS( config );
 *
 * ```
 *
 * @param {Object} `qrsConfig` Global configuration options
 *
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
	 * Set global configurations options for qrs. Can be used to change the configuration options after `qrs` has been initialized.
	 *
	 * @param {Object} `qrsConfig` Global configuration options
	 * @api public
	 */
	this.setConfig = function ( qrsConfig ) {
		if ( typeof qrsConfig !== 'undefined' && !_.isEmpty( qrsConfig ) ) {
			that.config = extend( that.config, qrsConfig );
		}
		return that.config;
	};

	/**
	 * Return the current configuration options.
	 *
	 * @returns {qrsConfig} `qrsConfig` Configuration object.
	 * @api public
	 */
	this.getConfig = function () {
		return that.config;
	};

	/**
	 * Change a single configuration property.
	 *
	 * **Example:**
	 *
	 * ```js
	 * qrs.set('host', 'myhost.domain.com');
	 * ```
	 *
	 * @param key {string} Key of the property
	 * @param val {Object} Value
	 * @api public
	 */
	this.set = function ( key, val ) {
		that.config[key] = val;
	};

	/**
	 * Retrieve a single configuration property.
	 *
	 * @param {String} `key`  Key of the property
	 * @returns {Object} Value of the requested property, otherwise undefined.
	 * @api public
	 */
	this.getConfigValue = function ( key ) {
		return that.config[key];
	};

	/**
	 * Return the Url for the REST call considering the given configuration options
	 *
	 * @param {string} `endpoint` Endpoint for the qrs call.
	 * @param {Array<string,object>} `urlParams` Additional URL parameters as key/value array.
	 * @return {String} The constructed Url.
	 * @api public
	 */
	this.getUrl = function ( endpoint, urlParams ) {
		var url = ((that.config.useSSL) ? 'https://' : 'http://');                                                            	// http://
		url += that.config.host;                                                                                              	// http://host
		url += (that.config.port && _.isNumber( that.config.port ) && that.config.port !== 0) ? ':' + that.config.port : '';  	// http[s]://host[:port]
		url += '/';                                                                                                          	// http[s]://host[:port]/
		url += ((that.config.virtualProxy && !_.isEmpty( that.config.virtualProxy )) ? that.config.virtualProxy + '/' : '');  	// http[s]://host[:port]/[vp/]
		url += (!S( endpoint ).startsWith( 'qrs/' ) ? 'qrs/' : '');
		url += endpoint;
		url += '/?';

		var params = urlParams || [];
		params.push( {'key': 'xrfkey', 'value': that.config.xrfkey} );
		params.forEach( function ( param ) {																					// parameters
			url += param.key + '=' + param.value + '&';
		} );
		url = S( url ).chompRight( '&' ).s;

		return url;
	};

	/**
	 * Same as `request()` but with `method: 'GET'`.
	 *
	 * **Example:**
	 * ```js
	 * qrs.get( 'about')
	 * 		.then( function ( data) {
	 * 			console.log('about: ', data );
	 * 		}, function ( err ) {
	 * 			console.error( err );
	 * 		});
	 * ```
	 * @param endpoint
	 * @param urlParams
	 * @returns {*|promise}
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
	 * @param {Array<string,object>} `urlParams` Additional URL parameters, defined as key/value array.
	 * @param {Object} `body` JSON object to be used as the body for the Http request.
	 * @returns {promise} Returns a promise.
	 *
	 * @api public
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

			//Todo: Encapsulate cert-file loading.
			//Todo: Support default local certificates.
			if ( that.config.authentication === 'certificates' ) {
				/*jshint ignore:start*/
				if ( that.config['cert'] ) {
					requestOptions.cert = (typeof that.config['cert'] === 'object' ? that.config['cert'] : fs.readFileSync( that.config['cert'] ) );
				}
				if ( that.config['key'] ) {
					requestOptions.key = (typeof that.config['key'] === 'object' ? that.config['key'] : fs.readFileSync( that.config['key'] ) );
				}
				if ( that.config['ca'] ) {
					requestOptions.ca = (typeof that.config['ca'] === 'object' ? that.config['ca'] : fs.readFileSync( that.config['ca'] ) );
				}
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
	 * Same as `request()` but with `method: 'POST'`.
	 *
	 * @param {String} `endpoint` QRS endpoint to be used.
	 * @param {Array<string,object>} `urlParams` Additional URL parameters, defined as key/value array.
	 * @param {Object} `body` Body to be posted, defined as JSON object.
	 * @returns {*|promise}
	 * @api public
	 */
	this.post = function ( endpoint, urlParams, body ) {
		return this.request( 'POST', endpoint, urlParams, body );
	};

	/**
	 * Same as `request()` but with `method: 'DELETE'`.
	 *
	 * @api public
	 */
	this.delete = function ( endpoint, id, urlParams ) {
		var finalEndpoint = S( endpoint ).ensureRight( '/' ) + id;
		return this.request( 'DELETE', finalEndpoint, urlParams );
	};

	/**
	 * 	Same as `request()` but with `method: 'PUT'`.
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
	 * Returns an array of loaded plugins. Use `registerPlugin()` to load a plugin.
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

		var required = [];
		switch ( that.config.authentication ) {
			case 'header':
				required = ['headerKey', 'headerValue', 'xrfkey', 'useSSL', 'virtualProxy'];
				return _validateConfigMissing( that.config, required );
			case 'ntlm':
				return true;
			case 'certificates':
				required = ['cert', 'key', 'ca'];
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
