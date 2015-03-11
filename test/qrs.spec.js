/*!
 * qrs <https://github.com/stefanwalther/qrs>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

var chai = require( 'chai' ),
  assert = chai.assert,
  should = chai.should(),
  QRS = new require( './../lib/qrs' ),
  leche = require( 'leche' ),
  withData = leche.withData,
  extend = require( 'extend-shallow' ),
  fsUtils = require( 'fs-utils' ),
  path = require( 'path' ),
  logger = require( './../lib/logger.js' );
;

var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );

var globalConfig = {
  host: testConfig.host,
  useSSL: testConfig.useSSL,
  xrfkey: testConfig.xrfkey,
  fiddler: testConfig.fiddler
};
var qrs;

describe( 'qrs', function () {

  withData( {

    'Header authentication': [{
      authentication: 'header',
      headerKey: testConfig.authentication.header.headerKey,
      headerValue: testConfig.authentication.header.headerValue,
      virtualProxy: testConfig.authentication.header.virtualProxy
    }]
    //,'NTLM authentication': [{authentication: 'ntlm'}]

  }, function ( sessionInfo ) {

    logger.silly( 'sessionInfo', sessionInfo );

    /**
     * Reset the configuration before each test.
     */
    beforeEach( function ( done ) {

      //logger.silly( 'testconfig => global: ', globalConfig );
      //logger.silly( 'testconfig => sessionInfo: ', sessionInfo );
      var testConfig = extend( globalConfig, sessionInfo );
      //logger.silly( 'testConfig for this run', testConfig );

      qrs = new QRS( testConfig );
      done();

    } );

    it( 'should be properly set up', function ( done ) {
      assert( typeof(qrs) === 'object' );
      assert( typeof(qrs.set) === 'function' );
      qrs.getConfig().should.not.be.empty;
      done();
    } );

    it( 'should receive startup params', function ( done ) {

      var qrs2 = new QRS( {host: 'testhost'} );
      var cfg = qrs2.getConfig();
      should.exist( cfg );
      qrs2.getConfig().should.have.property( 'host', 'testhost' );
      done();
    } );

    it( 'should allow to change params', function ( done ) {
      var qrs2 = new QRS( {host: 'testhost'} );
      qrs2.set( 'host', 'testhost2' );
      qrs2.getConfig().should.have.property( 'host', 'testhost2' );
      done();
    } );

    it( 'should properly create URLs', function ( done ) {

      // Default
      qrs.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
      qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

      // SSL
      qrs.setConfig( {useSSL: true, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
      qrs.getUrl( 'ssl/ping' ).should.equal( 'https://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

      // Virtual Proxy
      qrs.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: 'sso'} );
      qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

      done();
    } );

    it( 'should return something for /about', function ( done ) {

      qrs.query( 'about' )
        .then( function ( data ) {
          data.should.not.be.empty;
          data.should.have.property( 'schemaPath', 'About' );
        } )
        .catch( function ( error ) {
          logger.error( 'About error: ', error.response.statusMessage );
          assert( false );
        } )
        .done( function () {
          done()
        } );
    } );

    it( 'should return something if pinging', function ( done ) {
      qrs.query( 'ssl/ping' )
        .then( function ( data ) {
          console.log( 'ping => result', data );
          data.should.not.be.empty;
        } )
        .catch( function ( data ) {
          assert( false, 'ping does not work' );

        } )
        .done( function () {
          done()
        } );
    } );

  } );

} );
