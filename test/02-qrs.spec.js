/*!
 * qrs <https://github.com/stefanwalther/qrs>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

var chai = require( 'chai' );
var assert = chai.assert;
var should = chai.should();
var QRS = new require( './../lib/qrs' );
var leche = require( 'leche' );
var withData = leche.withData;
var extend = require( 'extend-shallow' );
var fsUtils = require( 'fs-utils' );
var path = require( 'path' );
var logger = require( './../lib/logger.js' );
var setup = require( './testSetup' );

var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );

var globalConfig = {
	host: testConfig.host,
	useSSL: testConfig.useSSL,
	xrfkey: testConfig.xrfkey,
	fiddler: testConfig.fiddler
};
var qrs;

describe( 'qrs', function () {

	withData( setup.testLoop, function ( sessionInfo ) {

		//logger.silly( 'sessionInfo', sessionInfo );

		/**
		 * Reset the configuration before each test.
		 */
		beforeEach( function ( done ) {

			var testConfig = extend( globalConfig, sessionInfo );
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

			qrs.get( 'about' )
				.then( function ( data ) {
					data.should.not.be.empty;
					data.should.have.property( 'schemaPath', 'About' );
				} )
				.catch( function ( error ) {
					console.error( error || {} );
					assert( false );
				} )
				.done( function () {
					done()
				} );
		} );

		it.skip( 'should return something if pinging', function ( done ) {
			qrs.get( 'ssl/ping' )
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

} )
;