'use strict';
var extend = require( 'extend-shallow' );
var _ = require( 'lodash' );
var Q = require( 'q' );
var request = require( 'request' );
var S = require( 'string' );
var fs = require( 'fs' );

var QRS = function QRS ( options ) {

	var that = this;
	this.config = {
		isSSL: false,
		xrfkey: 'ABCDEFG123456789',
		authentication: 'header'
	};
	if ( options && !_.isEmpty( options ) ) {
		this.config = extend( this.config, options );
	}

	/**
	 * Set configuration options
	 */
	this.setConfig = function ( opts ) {
		if ( typeof opts !== 'undefined' && !_.isEmpty( opts ) ) {
			that.config = extend( that.config, opts );
		}
		return that.config;
	};

	/**
	 * #Return the current configuration
	 * @returns {object}
	 */
	this.getConfig = function () {
		return that.config;
	};

	/**
	 * Change a property
	 *
	 * @param key {string} Key of the property
	 * @param val {*} Value
	 */
	this.set = function ( key, val ) {
		that.config[key] = val;
	};

	/**
	 * Get the value of a property.
	 * @param key {String}  Key of the property
	 * @returns {*} Value of the requested property, otherwise undefined.
	 */
	this.getConfigValue = function ( key ) {
		return that.config[key];
	};

	/**
	 * Return the Url for the REST call considering the configuration options
	 * @param endpoint {string} Endpoint for the QRS call.
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

	this.get = function ( endpoint, urlParams ) {
		return this.query( 'GET', endpoint, urlParams );
	};

	/**
	 * Generic method to query
	 *
	 * @param endpoint
	 * @param urlParams
	 * @returns {*|promise}
	 */
	this.query = function ( method, endpoint, urlParams, body ) {

		var defer = Q.defer();
		var validConfig = _validateConfig();

		if ( !validConfig ) {
			defer.reject( {error: {errorMsg: 'Invalid configuration', errSource: 'qrs.query'}} );
		} else {

			var url = this.getUrl( S( endpoint ).chompLeft( '/' ), urlParams );
			var headers = _getHeaders();

			var requestOptions = {
				method: method,
				url: url,
				headers: headers,
				proxy: that.config.fiddler ? 'http://127.0.0.1:8888' : null,
				json: body
				//timeout: 2000
			};
			if ( that.config.authentication === 'certificates' ) {
				/*jshint ignore:start*/
				if (that.config['cert'])  { requestOptions.cert = fs.readFileSync( that.config['cert'] );}
				if (that.config['key'])  {requestOptions.key = fs.readFileSync( that.config['key'] );}
				if (that.config['ca']) {requestOptions.ca = fs.readFileSync( that.config['ca'] );}
				/*jshint ignore:end*/
				if (that.config.passphrase && !_.isEmpty(that.config.passphrase)) {requestOptions.passphrase = that.config.passphrase;}
			}

			request( requestOptions, function ( error, response, responseBody ) {

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

	this.post = function ( endpoint, urlParams, body ) {
		return this.query( 'POST', endpoint, urlParams, body );
	};

	this.delete = function ( endpoint, id, urlParams ) {
		var finalEndpoint = S( endpoint ).ensureRight( '/' ) + id;
		return this.query( 'DELETE', finalEndpoint, urlParams );
	};

	this.put = function ( endpoint, id, urlParams, body ) {
		var finalEndpoint = S( endpoint ).ensureRight( '/' ) + id;
		return this.query( 'PUT', finalEndpoint, urlParams, body );
	};

	// ****************************************************************************************
	// Plugins
	// ****************************************************************************************
	this.plugins = [];
	this.registerPlugin = function ( plugin ) {
		if (!this[plugin.name.toLowerCase()]) {
			/*jshint -W055 */
			var o = new plugin( this);
			/*jshint +W055 */
			this.plugins[plugin.name.toLowerCase()] = o;
			this[plugin.name.toLowerCase()] = o;
		} else {
			throw new Error('Plugin cannot be registered. Namespace for qrs.' + plugin.name.toLowerCase() + ' is already reserved.');
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
	//Todo: impolement a more generic validation
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

module.exports = QRS;
