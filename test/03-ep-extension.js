/*global describe,it,beforeEach*/
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var  QRS = new require( './../lib/qrs' );
var  leche = require( 'leche' );
var  withData = leche.withData;
var  extend = require( 'extend-shallow' );
var  fsUtils = require( 'fs-utils' );
var  path = require( 'path' );
var setup = require( './testSetup' );

var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );
var globalConfig = {
	host: testConfig.host,
	useSSL: testConfig.useSSL,
	xrfkey: testConfig.xrfkey,
	fiddler: testConfig.fiddler
};
var qrs;

describe( 'qrs.extension', function () {
	withData( setup.testLoop, function ( sessionInfo ) {

		var testConfig = extend( globalConfig, sessionInfo );

		beforeEach( function ( done ) {
			qrs = new QRS( testConfig );
			done();
		} );

		it( 'should be an object', function (  ) {
			expect( qrs.extension ).to.exist;
		} );

	});

} );
