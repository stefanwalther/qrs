/*global describe,beforeEach,it*/
/*jshint -W030,-W117*/

'use strict';

var chai = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );
var expect = chai.expect;
var assert = chai.assert;
var QRS = new require( './../../lib/qrs' );
var nock = require( 'nock' );

chai.use(chaiAsPromised);


describe( 'qrs', function () {

	var qrs;

	/**
	 * Reset the configuration before each test.
	 */
	beforeEach( function ( ) {

		var config = {
			useSSL: false,
			port: 4242,
			host: 'myHost',
			xrfkey: '123456789ABCDEFG',
			virtualProxy: 'sso'
		} ;
		qrs = new QRS( config );
	} );

	it( 'should be properly set up', function (  ) {
		assert( typeof(qrs) === 'object' );
		assert( typeof(qrs.set) === 'function' );
		expect( qrs.getConfig() ).to.not.be.empty;
	} );

	it( 'should receive startup params', function (  ) {

		var qrs2 = new QRS( {host: 'testhost'} );
		var cfg = qrs2.getConfig();
		expect( cfg ).to.exist;
		expect( qrs2.getConfig() ).to.have.property( 'host', 'testhost' );
	} );

	it( 'should allow to change params', function (  ) {
		var qrs2 = new QRS( {host: 'testhost'} );
		qrs2.set( 'host', 'testhost2' );
		expect( qrs2.getConfig() ).to.have.property( 'host', 'testhost2' );
	} );

	it( 'should properly create URLs', function () {

		var qrs2 = new QRS(); // Create a new QRS to be independent from any config

		// Default
		qrs2.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
		expect( qrs2.getUrl( 'qrs/about' ) ).to.be.equal( 'http://myHost/qrs/about/?xrfkey=123456789ABCDEFG' );

		// SSL
		qrs2.setConfig( {useSSL: true, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
		expect( qrs2.getUrl( 'qrs/about' ) ).to.be.equal( 'https://myHost/qrs/about/?xrfkey=123456789ABCDEFG' );

		// Virtual Proxy
		qrs2.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: 'sso'} );
		expect( qrs2.getUrl( 'qrs/about' ) ).to.be.equal( 'http://myHost/sso/qrs/about/?xrfkey=123456789ABCDEFG' );

		// Port
		qrs2.setConfig( {
			useSSL: false,
			port: 4242,
			host: 'myHost',
			xrfkey: '123456789ABCDEFG',
			virtualProxy: 'sso'
		} );
		expect( qrs2.getUrl( 'qrs/about' ) ).to.be.equal( 'http://myHost:4242/sso/qrs/about/?xrfkey=123456789ABCDEFG' );
	} );


	it.skip( 'should fail if METHOD is not in (GET, POST, PUT, DELETE)', function ( ) {
		expect( true ).to.equal( false );
		done();
	} );

	describe( 'qrs.request', function () {
		it( 'should resolve properly', function () {

			nock( 'http://mock-host:4242/' )
					.get( '/qrs/about/?xrfkey=123456789ABCDEFG' )
					.reply( 200, 'Hello World' );

			qrs.setConfig( {
				port: 4242,
				host: 'mock-host',
				xrfkey: '123456789ABCDEFG',
				virtualProxy: ''
			} );
			return expect( qrs.request('GET', 'qrs/about' ) ).to.eventually.be.equal('Hello World');

		} );

		it.skip( 'should reject if parameters are missing', function (  ) {

			nock( 'http://mock-host:4242/' )
					.get( '/qrs/about/?xrfkey=123456789ABCDEFG' )
					.reply( 200, 'Hello World' );

			return expect( qrs.request('GET', '/qrs/about') ).to.be.rejected;
		} );
	} );

	describe( 'qrs.get', function () {
		it( 'should resolve for /qrs/about/', function ( ) {
			nock( 'http://mock-host:4242/' )
					.get( '/qrs/about/?xrfkey=123456789ABCDEFG' )
					.reply( 200, 'Hello World' );

			qrs.setConfig( {
				port: 4242,
				host: 'mock-host',
				xrfkey: '123456789ABCDEFG',
				virtualProxy: ''
			} );
			return expect( qrs.get('qrs/about' ) ).to.eventually.be.equal('Hello World');
		} );


	} );

} );
