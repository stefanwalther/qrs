'use strict';
var extend = require( 'extend-shallow' ),
  _ = require( 'lodash' ),
  Q = require( 'q' ),
  request = require( 'request' ),
  S = require( 'string' ),
  logger = require( './logger' );

var QRS = function ( options ) {

    var that = {};
    // default values
    that.config = {
      isSSL: false,
      xrfkey: 'ABCDEFG123456789',
      authentication: 'header'
    };
    logger.silly( 'qrs => before config: ', that.config );
    logger.silly( 'qrs => config to merge: ', options );
    if ( options && !_.isEmpty( options ) ) {
      that.config = extend( that.config, options );
    }
    logger.silly( 'qrs => config: ', that.config );

    return {
      /**
       * Return the base configuration
       */
      setConfig: function ( opts ) {
        if ( typeof opts !== 'undefined' && !_.isEmpty( opts ) ) {
          that.config = extend( that.config, opts );
        }
        return that.config;
      },
      getConfig: function () {
        return that.config;
      },

      /**
       * Change a property
       *
       * @param key {string} Key of the property
       * @param val {*} Value
       */
      set: function ( key, val ) {
        that.config[key] = val;
      },

      /**
       * Get the value of a property.
       * @param key {String}  Key of the property
       * @returns {*} Value of the requested property, otherwise undefined.
       */
      get: function ( key ) {
        return this.config[key];
      },

      // ****************************************************************************************
      // General helper for communicating with he QRS
      // ****************************************************************************************

      /**
       * Return the Url for the REST call considering the configuration options
       * @param endpoint {string} Endpoint for the QRS call.
       */
      getUrl: function ( endpoint ) {
        var url = ((that.config.useSSL) ? 'https://' : 'http://');                                                            // http://
        url += that.config.host;                                                                                              // http://host
        url += (that.config.port && that.config.port !== 0) ? ':' + that.config.port : '';                                    // http[s]://host[:port]
        url += +'/';                                                                                                          // http[s]://host[:port]/
        url += ((that.config.virtualProxy && !_.isEmpty( that.config.virtualProxy )) ? that.config.virtualProxy + '/' : '');  // http[s]://host[:port]/[vp/]
        url += (!S( endpoint ).startsWith( 'qrs/' ) ? 'qrs/' : '');
        url += endpoint;
        url += '/?xrfkey=' + that.config.xrfkey;
        return url;

      },

      //all: function () {
      //  return this.query( '/qrs/about/all' );
      //},

      /**
       * Pings the server and returns ??.
       * @todo: Decide what to return here
       */
      ping: function () {

      },
      query: function ( endpoint ) {

        var defer = Q.defer();

        //logger.silly( 'qrs => query => config: ', that.config );
        var validConfig = this._validateConfig();

        if ( !validConfig ) {
          defer.reject( {error: {errorMsg: 'Invalid configuration'}} );
        } else {

          var url = this.getUrl( S( endpoint ).chompLeft( '/' ) );
          var headers = this._getHeaders();
          logger.silly( 'query => url', url );
          logger.silly( 'query => haders', headers );

          request.get( {
              url: url,
              headers: headers,
              proxy: that.config.fiddler ? "http://127.0.0.1:8888" : null
            }, function ( error, response, body ) {

              if ( error || response.statusCode !== 200 ) {
                defer.reject( {
                  error: error,
                  response: response
                } );
              } else {
                defer.resolve( JSON.parse( body ) );
              }
            }
          );

        }
        return defer.promise;

      },

      // ****************************************************************************************
      // Internal Helper
      // ****************************************************************************************
      _getHeaders: function () {

        var header = {
          "X-Qlik-xrfkey": that.config.xrfkey
        };
        header[that.config.headerKey] = that.config.headerValue;
        return header;

      },
      _validateConfig: function () {

        switch ( that.config.authentication ) {
          case 'header':
            var required = ['headerKey', 'headerValue', 'xrfkey', 'isSSL', 'virtualProxy']
            return this._validateConfigMissing( that.config, required );
            break;
        }

      },
      _validateConfigMissing: function ( configs, required ) {

        var missing = [];
        _.each( required, function ( item ) {
          //logger.silly( '--checking: ', item );
          if ( !configs.hasOwnProperty( item ) ) {
            logger.error( 'Param ' + item + ' is missing.' );
            missing.push( item );
          }
        } )
        return !(missing.length > 0);

      },

      // ****************************************************************************************
      // Classes
      // ****************************************************************************************
      /**
       * Extension class
       */
      extensions: require( './extensions' )( this )
    }

  }
  ;

module.exports = QRS;
