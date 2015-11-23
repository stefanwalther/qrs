/*global describe, it, beforeEach*/
/*jshint -W030,-W117*/

'use strict';
var chai = require( 'chai' );
var expect = chai.expect;
var assert = chai.assert;
var QRS = new require( './../../lib/qrs' );
var extend = require( 'extend-shallow' );
var testSetup = require( './../testSetup' );

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

			it( 'should return something for /about', function ( done ) {

				qrs.get( 'qrs/about' )
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

			//Todo: Ping doesn't work
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
						done();
					} );
			} );

		} );
	} );
} );
