/*global describe, it, beforeEach*/

'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var assert = chai.assert;
var QRS = new require( './../../lib/qrs' );
var testSetup = require( './../testSetup' );

var qrs;
var globalConfig = testSetup.globalConfig;

describe( 'qrs', function () {

	/**
	 * Reset the configuration before each test.
	 */
	beforeEach( function ( done ) {

		var testConfig = testSetup.testLoop[0]
		qrs = new QRS( testConfig );
		done();

	} );

	it( 'should be properly set up', function ( done ) {
		assert( typeof(qrs) === 'object' );
		assert( typeof(qrs.set) === 'function' );
		expect(qrs.getConfig() ).to.not.be.empty;
		done();
	} );

	it( 'should receive startup params', function ( done ) {

		var qrs2 = new QRS( {host: 'testhost'} );
		var cfg = qrs2.getConfig();
		expect( cfg ).to.exist;
		expect(qrs2.getConfig() ).to.have.property( 'host', 'testhost' );
		done();
	} );

	it( 'should allow to change params', function ( done ) {
		var qrs2 = new QRS( {host: 'testhost'} );
		qrs2.set( 'host', 'testhost2' );
		expect(qrs2.getConfig() ).to.have.property( 'host', 'testhost2' );
		done();
	} );

	it( 'should properly create URLs', function () {

		var qrs2 = new QRS(); // Create a new QRS to be independent from any config

		// Default
		qrs2.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
		expect(qrs2.getUrl( 'ssl/ping' ) ).to.be.equal( 'http://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

		// SSL
		qrs2.setConfig( {useSSL: true, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
		expect(qrs2.getUrl( 'ssl/ping' ) ).to.be.equal( 'https://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

		// Virtual Proxy
		qrs2.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: 'sso'} );
		expect(qrs2.getUrl( 'ssl/ping' ) ).to.be.equal( 'http://myHost/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

		// Port
		qrs2.setConfig( {
			useSSL: false,
			port: 4242,
			host: 'myHost',
			xrfkey: '123456789ABCDEFG',
			virtualProxy: 'sso'
		} );
		expect(qrs2.getUrl( 'ssl/ping' ) ).to.be.equal( 'http://myHost:4242/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );
	} );

} );
