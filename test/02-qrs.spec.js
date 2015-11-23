/*global describe, it, beforeEach*/

'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var assert = chai.assert;
var QRS = new require( './../lib/qrs' );
var extend = require( 'extend-shallow' );
var testSetup = require( './testSetup' );

var qrs;
var globalConfig = testSetup.globalConfig;

describe( 'qrs', function () {

	var testConfig = null;
	testSetup.testLoop.forEach( function ( testLoopConfig ) {

		describe( 'with ' + testLoopConfig.name, function () {

			/**
			 * Reset the configuration before each test.
			 */
			beforeEach( function ( done ) {

				testConfig = extend( globalConfig, testLoopConfig.config );
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
				expect( cfg ).to.exist;
				qrs2.getConfig().should.have.property( 'host', 'testhost' );
				done();
			} );

			it( 'should allow to change params', function ( done ) {
				var qrs2 = new QRS( {host: 'testhost'} );
				qrs2.set( 'host', 'testhost2' );
				qrs2.getConfig().should.have.property( 'host', 'testhost2' );
				done();
			} );

			it( 'should properly create URLs', function () {

				var qrs2 = new QRS(); // Create a new QRS to be independent from any config

				// Default
				qrs2.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
				qrs2.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

				// SSL
				qrs2.setConfig( {useSSL: true, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
				qrs2.getUrl( 'ssl/ping' ).should.equal( 'https://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

				// Virtual Proxy
				qrs2.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: 'sso'} );
				qrs2.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

				// Port
				qrs2.setConfig( {
					useSSL: false,
					port: 4242,
					host: 'myHost',
					xrfkey: '123456789ABCDEFG',
					virtualProxy: 'sso'
				} );
				qrs2.getUrl( 'ssl/ping' ).should.equal( 'http://myHost:4242/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );
			} );

			it( 'should return something for /about', function ( done ) {

				qrs.get( 'about' )
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.object;
						expect( data ).to.have.a.property( 'schemaPath', 'About' );
					}, function ( err ) {
						expect( err ).to.not.exist;
					} )
					.done( function () {
						done();
					} );
			} );

			it.skip( 'should return something if pinging', function ( done ) {
				qrs.get( 'ssl/ping' )
					.then( function ( data ) {
						console.log( 'ping => result', data );
						data.should.not.be.empty;
					} )
					.catch( function ( /*data*/ ) {
						assert( false, 'ping does not work' );
					} )
					.done( function () {
						done();
					} );
			} );

		} );
	} )
} );
