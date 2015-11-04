/*global describe,it,beforeEach*/
/* jshint -W030 */
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var QRS = new require( './../lib/qrs' );
var leche = require( 'leche' );
var withData = leche.withData;
var extend = require( 'extend-shallow' );
var fsUtils = require( 'fs-utils' );
var path = require( 'path' );
var setup = require( './testSetup' );

var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );
var globalConfig = {
	host: testConfig.host,
	useSSL: testConfig.useSSL,
	xrfkey: testConfig.xrfkey,
	fiddler: testConfig.fiddler
};
var qrs;

describe.only( 'qrs.extension', function () {
	withData( setup.testLoop, function ( sessionInfo ) {

		var testConfig = extend( globalConfig, sessionInfo );

		beforeEach( function ( done ) {
			qrs = new QRS( testConfig );
			done();
		} );

		it( 'should be an object', function () {
			expect( qrs.extension ).to.exist;
		} );

		it( 'should return all installed extensions', function ( done ) {
			qrs.extension.getInstalled()
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.be.an.array;
				}, function ( err ) {
					expect( err ).to.not.exist;
				} )
				.done( function (  ) {
					done();
				});
		} );

		it.skip( 'should return all installed extensions, reduced by a filter', function ( done ) {



		} );

	} );

} );
