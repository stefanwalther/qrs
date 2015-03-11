'use strict';
var extend = require( 'extend-shallow' );

var QRS = function ( options ) {

    this.config = {
      isSSL: false,
      host: 'localhost'
    };

    this.config = extend( this.config, options );

    return {
      /**
       * Return the base configuration
       */
      config: this.config,

      /**
       * Change a property
       *
       * @param key {string} Key of the property
       * @param val {*} Value
       */
      set: function ( key, val ) {
        this.config[key] = val;
      },

      /**
       * Get the value of a property.
       * @param key {string] Key of the property
       * @returns {*} Value of the requested property, otherwise undefined.
       */
      get: function ( key ) {
        return this.config[key];
      },

      /**
       * Extension class
       */
      extensions: require( './extensions' )( this )
    }

  }
  ;

module.exports = QRS;
