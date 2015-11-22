/*global describe,before,beforeEach,it*/
'use strict';

var chai = require( 'chai' );
var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;
var QRS = new require( './../lib/qrs' );
var fsUtils = require( 'fs-utils' );
var path = require( 'path' );
var testSetup = require( './testSetup' );

var qrs;
var globalConfig = testSetup.globalConfig;

describe( 'qrs object', function () {

	/**
	 * Reset the configuration before each test.
	 */
	beforeEach( function ( done ) {

		qrs = new QRS( globalConfig );
		done();

	} );

	it( 'should be properly set up', function ( done ) {
		assert( typeof(qrs) === 'object' );
		assert( typeof(qrs.set) === 'function' );
		qrs.getConfig().should.not.be.empty;
		done();
	} );

	it( 'should have default options', function () {
		var qrsDefault = new QRS( {} );
		var c = qrsDefault.getConfig();
		expect( c ).to.not.be.empty;
		expect( c ).to.have.property( 'host', '127.0.0.1' );
		expect( c ).to.have.property( 'useSSL', false );
		expect( c ).to.have.property( 'xrfkey', 'ABCDEFG123456789' );
		expect( c ).to.have.property( 'authentication', 'windows' );
		expect( c ).to.have.property( 'headerKey', '' );
		expect( c ).to.have.property( 'headerValue', '' );
		expect( c ).to.have.property( 'virtualProxy', '' );
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

	describe( 'qrs.getUrl', function () {

		it( 'should properly return URLs', function () {

			// Default
			qrs.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

			// SSL
			qrs.setConfig( {useSSL: true, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'https://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

			// Virtual Proxy
			qrs.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: 'sso'} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

			// Empty Virtual Proxy
			qrs.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: ''} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

			// Port
			qrs.setConfig( {
				useSSL: false,
				port: 4242,
				host: 'myHost',
				xrfkey: '123456789ABCDEFG',
				virtualProxy: 'sso'
			} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost:4242/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

		} );

		it( 'should allow to pass in port a string or as number', function () {
			qrs.setConfig( {
				useSSL: false,
				port: 4242,
				host: 'myHost',
				xrfkey: '123456789ABCDEFG',
				virtualProxy: 'sso'
			} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost:4242/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );

			qrs.setConfig( {
				useSSL: false,
				port: '4242',
				host: 'myHost',
				xrfkey: '123456789ABCDEFG',
				virtualProxy: 'sso'
			} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost:4242/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );
		} );

		it( 'should revert to default values if port is not a number', function () {
			qrs.setConfig( {
				useSSL: false,
				port: 'abc',
				host: 'myHost',
				xrfkey: '123456789ABCDEFG',
				virtualProxy: 'sso'
			} );
			qrs.getUrl( 'ssl/ping' ).should.equal( 'http://myHost/sso/qrs/ssl/ping/?xrfkey=123456789ABCDEFG' );
		} );

		it( 'should handle URL params when creating the URL', function () {

			qrs.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: 'sso'} );
			expect( qrs.getUrl( 'about', [{'key': 'myFilter', 'value': 'filtervalue'}, {
				'key': 'param',
				'value': 'paramValue'
			}] ) ).to.be.equal( 'http://myHost/sso/qrs/about/?myFilter=filtervalue&param=paramValue&xrfkey=123456789ABCDEFG' );

		} );

		it( 'should throw an exception if urlParams is not an array', function () {
			qrs.setConfig( {useSSL: false, host: 'myHost', xrfkey: '123456789ABCDEFG', virtualProxy: 'sso'} );
			expect( qrs.getUrl.bind( null, 'about', {
				'key': 'myFilter',
				'value': 'filterValue'
			} ) ).to.throw( 'Parameter urlParams needs to be an array' );
		} );

	} );
} );
